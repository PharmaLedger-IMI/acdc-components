import {Component, Input} from '@angular/core';
import {Event} from '../acdc/event.model';
import * as L from 'leaflet';
import {Icon, LatLngTuple, Map, Marker} from 'leaflet';
import 'leaflet.markercluster';


export class EventMapOptions {
  enableCircles: boolean;

  constructor(enableCircles = false) {
    this.enableCircles = enableCircles;
  }
}

@Component({
  selector: 'app-event-map',
  templateUrl: './event-map.component.html',
  styleUrls: ['./event-map.component.css']
})
export class EventMapComponent {

  private map: any;
  private mapOptions: EventMapOptions = new EventMapOptions();

  /** CORE: Receive an input from event-map component and render a map */
  @Input() set eventMapOptions(eventMapOptions: EventMapOptions) {
    this.mapOptions = eventMapOptions;
  }

  @Input() set dataReceiver(events: Event[] | undefined) {
    console.log('event-map.component.dataReceiver=', events);
    if (events) {
      const markers = L.featureGroup();
      const circles: L.Circle[] = [];
      events.forEach(event => {
        const eventInputData = event.eventInputs[0].eventInputData;
        const snCheckLocation = eventInputData.snCheckLocation;

        if (!!snCheckLocation && ('latitude' in snCheckLocation && 'longitude' in snCheckLocation)) {
          const lat = snCheckLocation.latitude;
          const long = snCheckLocation.longitude;

          const eventOutputData = event.eventOutputs[0].eventOutputData;
          const checkResult = eventOutputData.snCheckResult;

          const icon = this.buildIcon(checkResult);
          const popup = this.buildPopup(event.eventId, [
            eventInputData.productCode,
            eventOutputData.nameMedicinalProduct,
            checkResult
          ]);
          const marker = this.buildMarker([lat, long], icon, popup);
          marker.addTo(markers);
          // markers.push(this.buildMarker([lat, long], icon, popup));
          if (this.mapOptions.enableCircles) {
            circles.push(L.circle([lat, long], {
              color: '#7e1fd2',
              fillColor: '#7b0cf9',
              fillOpacity: 0.15,
              radius: snCheckLocation.accuracy || 50
            }));
          }
        }
      });

      if (typeof this.map !== 'undefined') {
        this.resetMap(this.map);
      }

      this.map = this.buildMap();
      const markersLayer = this.buildMarkersLayer(markers);
      const circleLayer = L.layerGroup(circles);

      markersLayer.addTo(this.map);
      circleLayer.addTo(this.map);

      try {
        this.map.fitBounds(markers.getBounds());
      } catch (e) {
      }

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
    // Icon anchor options: the coordinates of the "tip" of the icon (relative to its top left corner).
    // Centered by default if size is specified.
    return new L.Icon({
      iconUrl,
      shadowUrl: CustomIcon.Shadow,
      iconAnchor: [12, 41],
      shadowAnchor: [12, 41],
      popupAnchor: [0, -41]
    });
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
    const domPopup = document.getElementsByClassName('leaflet-popup');
    let popupHover = false;

    const addListener = (): void => {
      if (domPopup.length > 0) {
        const target = domPopup[0];
        target.addEventListener('mouseover', () => {
          popupHover = true;
        }, false);

        target.addEventListener('mouseleave', () => {
          popupHover = false;
          marker.closePopup();
        }, false);
      }
    };


    const marker = L.marker(latLong, {icon});
    marker.bindPopup(popup, {offset: L.point(0, 20)});
    marker.on('mouseover', (event) => {
      marker.openPopup();
      addListener();
    });

    marker.on('mouseout', (event) => {
      new Promise(r => setTimeout(r, 250)).then(() => {
        if (!popupHover) {
          marker.closePopup();
        }
      });
    });

    return marker;
  }

  /**
   * Build a data points markers and clustering feature
   * @param markers data points collection
   */
  buildMarkersLayer(markers: L.FeatureGroup): any {
    // const markersLayer = L.featureGroup(markers);
    const markersClustersLayer = L.markerClusterGroup({
      chunkedLoading: true,
      disableClusteringAtZoom: 18,
      spiderfyOnMaxZoom: true
    });
    markersClustersLayer.addLayer(markers);
    return markersClustersLayer;
  }

  /**
   * Build map base layer
   */
  buildMap(): Map {
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 3,
      maxZoom: 18,
      // noWrap: true,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    return L.map('map', {
      center: [0, 0],
      zoom: 5,
      layers: [baseLayer]
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
