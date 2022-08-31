import * as http from "http";
import * as https from "https";
import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { AppResourceRepository } from './appresource.repository';
import { Event } from './event.entity';
import { EventRepository } from './event.repository';
import { EventTraceability } from './eventtraceability.dto';

@Injectable()
export class EventService {
  private eventRepository: EventRepository;
  private arcRepository: AppResourceRepository;

  constructor(private connection: Connection) {
    this.arcRepository = this.connection.getCustomRepository(AppResourceRepository);
    this.eventRepository = connection.getCustomRepository(EventRepository);
  }

  /**
   * Get one Event from the database.
   * @param id 
   * @param askFgt If true, invoke /traceability/create on FGT,
   * and enrich the event.traceability. If not, enrich the event.traceability with
   * information about requesting further information from fgt.
   * @returns the event fetch from database
   */
  async getOne(id: string, askFgt?: boolean): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    await this.enrichTrace(event, !askFgt);
    return event;
  }

  /**
   * Enrich the event.traceability property with traceability information.
   * @param event 
   * @param dryRun if true, then only check if this event is suitable to create a traceability request.
   */
  async enrichTrace(event: Event, dryRun: boolean) {
    if (!event.eventInputs || event.eventInputs.length <= 0) {
      return await this.enrichNoTrace(event, "No event inputs available!");
    }
    const evtInput = event.eventInputs[0];
    // Consider more elements on the array ? No. One scan may generate multiple Events,
    // but the scanned inputs are always on the first event.
    if (!evtInput["eventInputData"]) {
      return await this.enrichNoTrace(event, "No event input eventInputData!");
    }
    const evtInputData = evtInput.eventInputData;
    if (!evtInputData["productCode"]) {
      return await this.enrichNoTrace(event, "No event input data productCode available!");
    }
    const gtin = evtInputData["productCode"];
    if (!evtInputData["batch"]) {
      return await this.enrichNoTrace(event, "No event input data batch available!");
    }
    const batchNumber = evtInputData["batch"];
    if (!evtInputData["serialNumber"]) {
      return await this.enrichNoTrace(event, "No event input data serialNumber available!");
    }
    const serialNumber = evtInputData["serialNumber"];

    // TODO - check that the event belongs to the same MAH ?

    let fgtUrl: string;
    let u : URL;
    try {
      fgtUrl = await this.arcRepository.findConfigString("fgt.url");
      u = new URL(fgtUrl);
      // Demo restrictions
      if (!u.hostname || !u.hostname.endsWith(".pharmaledger.pdmfc.com")) {
        throw "For security reasons fgt.url configurations must end with pharmaledger.pdmfc.com";
      }
    } catch (e) {
      if (e.toString().startsWith("No AppResource.key=fgt.url")) {
        return await this.enrichNoTrace(event, "Database schema outdated. "
          +"You probably need to execute the script backoffice-backend/lib/sql/acdc/change/do_00001_fgtIntegration/run.sql. "
          +"Root cause:"+e.toString());
      } else {
        return await this.enrichNoTrace(event, e.toString());
      }
    }
    let headers : any = {};
    let fgtAuthorization: string = "";
    try {
      fgtAuthorization = await this.arcRepository.findConfigString("fgt.authorization");
      if (fgtAuthorization.startsWith("Onfvp ")) { // "Basic " rot13
        fgtAuthorization = this.rot13(fgtAuthorization);
      }
      if (fgtAuthorization) {
        headers["Authorization"] = fgtAuthorization;
      }
    } catch (e) {
      console.log(e); // ignore lack of authorization
    }

    if (dryRun) {
      event.traceability = new EventTraceability(true, "There could be additional information on Finished Goods Traceability");
      return;
    }

    const res = await this.jsonPost(new URL(u.pathname+'/traceability/create',u), {
      headers: headers,
      body: {
          "gtin": gtin,
          "batchNumber": batchNumber,
          "serialNumber": serialNumber
      }
    });

    event.traceability = new EventTraceability(true, "See response.", res);
  }

  async enrichNoTrace(event: Event, message: string) {
    event.traceability = new EventTraceability(false, message);
  }

  // Based on https://codereview.stackexchange.com/questions/132125/rot13-javascript
  rot13(str) {
    var input     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var output    = 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm';
    var index     = x => input.indexOf(x);
    var translate = x => index(x) > -1 ? output[index(x)] : x;
    return str.split('').map(translate).join('');
  }

  // Based on
  // https://stackoverflow.com/questions/6158933/how-is-an-http-post-request-made-in-node-js
  async jsonHttpRequest(url: URL, { body, ...options }) : Promise<any> {
    const bodyToSend = (body && typeof body != "string") ? JSON.stringify(body) : body;

    const protocol = url.protocol;
    console.log("URL", url, protocol);
    if (!options['hostname']) {
        options.hostname = url.hostname;
    }
    if (!options['port']) {
        options.port = url.port;
    }
    if (!options['path']) {
        options.path = url.pathname;
    }
    if (!options.method) {
      options.method = "POST";
    }
    if (!options.headers) {
      options.headers = {
        'content-type': 'application/json',
      };
    } else if (!options.headers['content-type']) {
      options.headers['content-type'] = 'application/json';
    }
    if (bodyToSend)
      options.headers['content-length'] = Buffer.byteLength(bodyToSend);

    const beforeReq = new Date();
    let p = new Promise((resolve, reject) => {
      // debug request
      console.log(protocol + " " + options.method, JSON.stringify(options), bodyToSend);

      const req = ((protocol === "http" || protocol === "http:") ? http : https).request(
        {
          ...options,
        },
        res => {
          const chunks = [];
          res.on('data', data => chunks.push(data));
          res.on('end', () => {
            let resBody = Buffer.concat(chunks);
            console.log("res.headers=", res.headers);
            const contentType = res.headers['content-type'];
            if (contentType && contentType.startsWith('application/json')) {
              resolve(JSON.parse(resBody.toString())); // seems to be a JSON reply. Attempt to parse.
            } else if (contentType && contentType.startsWith('text/')) {
              resolve(resBody.toString()); // seems to be readable text.
            } else {
              resolve(resBody); // don't know what content-type is this. Return it as a Buffer.
            }
          });
        }
      );
      req.on('error', (e)=> { console.log('ERROR',e); reject });
      if (bodyToSend) {
        req.write(bodyToSend);
      }
      req.end();
    });

    // debug reply
    p.then((r) => {
      const afterRes = new Date();
      const ellapsed = afterRes.getTime() - beforeReq.getTime();
      console.log(`res ${ellapsed}ms`, r);
    });

    return p;
  }

  async jsonGet(url : URL, { body, ...options }) : Promise<any> {
    options.method = "GET";
    return this.jsonHttpRequest(url, { body, ...options });
  }

  async jsonPost(url :URL, { body, ...options }) : Promise<any> {
    options.method = "POST";
    return this.jsonHttpRequest(url, { body, ...options });
  }
}
