import {Component, Input, OnInit} from '@angular/core';

import {AppComponent} from '../app.component';
import {Event} from '../acdc/event.model';
import {EventService} from '../event.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {EventInput} from '../acdc/eventinput.model';
import {EventOutput} from '../acdc/eventoutput.model';
import {EventMapOptions} from "../event-map/event-map.component";

@Component({
  selector: 'app-event',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {

  event?: Event;
  eventMetadata?: object;
  eventInputs?: EventInput[];
  eventOutputs?: EventOutput[];
  eventMapOptions = new EventMapOptions(true);

  constructor(
    private appComponent: AppComponent,
    private eventService: EventService,
    private route: ActivatedRoute,
    private location: Location
  ) {
  }

  ngOnInit(): void {
    this.appComponent.setNavMenuHighlight('data', 'event', 'Event Detail');
    this.getEvent();
  }

  getEvent(askFgt?: boolean): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (!eventId) {
      throw new Error('request id is null');
    }
    console.log(`eventDetail.component.getEvent id=${eventId}`);
    this.eventService.getEvent(eventId, askFgt).subscribe((resp) => {
      const {eventInputs, eventOutputs, ...event} = resp;
      this.eventInputs = eventInputs;
      this.eventOutputs = eventOutputs;
      this.eventMetadata = event;
      resp.createdOn = new Date(event.createdOn);
      this.event = resp;
    });
  }

  goBack(): void {
    this.location.back();
  }

  askFgt(): void {
    this.getEvent(true);
  }

  getTraceabilityTitle(responseKey: any): void {
    return this.event?.traceability?.response[responseKey]?.title;
  }
}
