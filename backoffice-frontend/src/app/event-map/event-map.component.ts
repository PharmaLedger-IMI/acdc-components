import {Component, Input} from '@angular/core';
import {Event} from '../acdc/event.model';
import * as L from 'leaflet';
import {Icon, LatLngTuple, Map, Marker} from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-event-map',
  templateUrl: './event-map.component.html',
  styleUrls: ['./event-map.component.css']
})
export class EventMapComponent {

  private map: any;
  private dataPoints: any = [];

  /** CORE: Receive an input from event-map component and render a map */
  @Input() set dataReceiver(events: Event[] | undefined) {
    console.log('event-map.component.dataReceiver=', events);
    if (events) {
      const markers = events.map(event => {
        const eventInputData = event.eventInputs[0].eventInputData;
        const lat = eventInputData.snCheckLocation.latitude;
        const long = eventInputData.snCheckLocation.longitude;
        this.dataPoints.push([lat, long]);

        const eventOutputData = event.eventOutputs[0].eventOutputData;
        const checkResult = eventOutputData.snCheckResult;

        const icon = this.buildIcon(checkResult);
        const popup = this.buildPopup(event.eventId, [
          eventInputData.productCode,
          eventOutputData.nameMedicinalProduct,
          checkResult
        ]);

        return this.buildMarker([lat, long], icon, popup);
      });

      if (typeof this.map !== 'undefined') {
        this.resetMap(this.map);
      }

      this.map = this.buildMap(markers);
      this.map.fitBounds(this.dataPoints);
      this.map.setMaxBounds([[-90, -180], [90, 180]]);
      this.map.on('click', (ev: any) => {
        console.log('# map', ev);
      });
    }
  }

  /**
   * Build a personalized icon according to the type of event output
   * @param checkResult type of event output
   * @return Icon red -> Suspect,  green -> Authentic, yellow -> Others (TimeOut, Aborted, etc.)
   */
  buildIcon(checkResult: string): Icon<any> {
    const typeIcons = checkResult as keyof typeof CustomIcon;
    const iconUrl = CustomIcon[typeIcons] || CustomIcon.Other;
    return new L.Icon({iconUrl, shadowUrl: CustomIcon.Shadow});
  }

  /**
   * Build a popup to be displayed when a marker is clicked
   * @param popupTitle - Popup first line (bold)
   * @param popupContent - Each element in array is a line
   */
  buildPopup(popupTitle: string, popupContent: string[]): L.Popup {
    const url = '/backoffice/event/' + popupTitle;
    const title = `<strong><a href=${url}>${popupTitle}</a></strong>`;
    const content = popupContent.join('<br/>');
    return L.popup().setContent(`${title}<br/>${content}`);
  }

  /**
   * Build a data point (Marker) from data provided
   * @param latLong - Latitude and Longitude as [lat, long]
   * @param icon - marker icon
   * @param popup - marker popup
   */
  buildMarker(latLong: LatLngTuple, icon: Icon, popup: L.Popup): Marker {
    return L.marker(latLong, {icon})
      .bindPopup(popup)
      .on('click', (ev: any) => {
        console.log('# marker', ev);
      });
  }

  /**
   * Receive a Marker collection to return a map compiled
   * @param markers data points collection
   */
  buildMap(markers: Marker[]): Map {
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 3,
      maxZoom: 18,
      // noWrap: true,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    const markersLayer = L.layerGroup(markers);
    const markersClustersLayer = L.markerClusterGroup({
      chunkedLoading: true,
      disableClusteringAtZoom: 11,
      spiderfyOnMaxZoom: false
    });
    markersClustersLayer.addLayer(markersLayer);

    return L.map('map', {
      center: [0, 0],
      zoom: 5,
      layers: [baseLayer, markersClustersLayer]
    });
  }

  /** Reset map to be render with new data */
  resetMap(map: Map): void {
    try {
      map.off();
      map.remove();
    } catch (e) {
      console.error('event-map.component.resetMap error ', e);
    }
  }
}

enum CustomIcon {
  Authentic = 'assets/leaflet-color-markers/marker-icon-green.png',
  Suspect = 'assets/leaflet-color-markers/marker-icon-red.png',
  Other = 'assets/leaflet-color-markers/marker-icon-gold.png',
  Shadow = 'assets/leaflet-color-markers/marker-shadow.png',
}
