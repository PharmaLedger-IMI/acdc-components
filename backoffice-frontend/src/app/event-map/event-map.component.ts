import {Component, Input} from '@angular/core';
import {Event} from '../acdc/event.model';
import * as L from 'leaflet';
import {Icon, Map, Marker} from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-event-map',
  templateUrl: './event-map.component.html',
  styleUrls: ['./event-map.component.css']
})
export class EventMapComponent {

  private map: any;

  /** CORE: Receive an input from event-map component and render a map */
  @Input() set dataReceiver(events: Event[] | undefined) {
    console.log('event-map.component.dataReceiver:', events);
    if (events) {
      const markers = this.buildMarkers(events);
      this.resetMap();
      this.map = this.buildMap(markers);

      this.map.on('click', (ev: any) => {
        console.log('# map', ev);
      });
    }
  }

  /**
   * Receive a Marker collection to return a map compiled
   * @param dataSource Data points collection
   */
  buildMap(dataSource: Marker[]): Map {
    const title = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    const markers = L.layerGroup(dataSource);
    const markersClusters = L.markerClusterGroup({
      // chunkedLoading: true,
      // disableClusteringAtZoom: 11,
      // spiderfyOnMaxZoom: false
    });
    markersClusters.addLayer(markers);

    // TODO -> Set map center dynamically
    return L.map('map', {
      center: [46.28945, 2.351519],
      zoom: 5,
      layers: [title, markersClusters]
    });
  }

  /**
   * Build data points (Markers) from a data collection
   * @param events events data collection
   */
  buildMarkers(events: Event[]): Marker[] {
    return events.map(event => {
      const eventInputData = event.eventInputs[0].eventInputData;
      const eventOutputData = event.eventOutputs[0].eventOutputData;
      const [lat, long] = eventInputData.snCheckLocation.split(',').map(value => parseFloat(value));
      const result = eventOutputData.snCheckResult;

      const icon = this.buildMarkerIcon(result);
      const popup = this.buildMarkerPopup(event.eventId, [eventInputData.productCode, eventOutputData.nameMedicinalProduct, result]);

      const marker = L.marker([lat, long], {icon}).bindPopup(popup).openPopup();
      marker.on('click', (ev: any) => {
        console.log('# marker', ev);
      });

      return marker;
    });
  }

  /**
   * Build a personalized icon according to the type of event output
   * @param checkResult type of event output
   * @return Icon red -> Suspect,  green -> Authentic, yellow -> Others (TimeOut, Aborted, etc.)
   */
  buildMarkerIcon(checkResult: string): Icon<{ shadowUrl: IconsUrl; iconUrl: IconsUrl }> {
    const typeIconsUrl = checkResult as keyof typeof IconsUrl;
    const url = IconsUrl[typeIconsUrl] || IconsUrl.Other;
    return new L.Icon({iconUrl: url, shadowUrl: url});
  }

  /**
   * Build a popup to be displayed when a marker is clicked
   * @param popupTitle Popup first line, in bold
   * @param poputContent Each element in array is a line
   */
  buildMarkerPopup(popupTitle: string, poputContent: string[]): L.Popup {
    const url = '/backoffice/event/' + popupTitle;
    const title = `<strong><a href=${url}>${popupTitle}</a></strong>`;
    const content = poputContent.join('<br/>');
    return L.popup().setContent(`${title}<br/>${content}`);
  }

  /** Reset map to be render with new data */
  resetMap(): void {
    try {
      this.map.off();
      this.map.remove();
    } catch (e) {
    }
  }
}

enum IconsUrl {
  Authentic = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  Suspect = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  Other = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
}
