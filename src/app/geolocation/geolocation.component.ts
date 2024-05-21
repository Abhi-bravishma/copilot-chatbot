import { Component } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import  {IMessage} from 'src/app/chatmessages';

@Component({
  selector: 'app-geolocation',
  templateUrl: './geolocation.component.html',
  styleUrls: ['./geolocation.component.css']
})
export class GeolocationComponent {
  status: string = '';
  mapLink: string = '';
  chatMessages!: IMessage [];

  constructor(private socket: Socket) { }

  geoFindMe() {
    this.status = "Locating…";
    this.mapLink = "";

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => this.success(position),
        () => this.error()
      );
    } else {
      this.status = "Geolocation is not supported by your browser";
    }
  }

  success(position: GeolocationPosition) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    this.status = "";
    this.mapLink = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    this.socket.emit('geolocation', {
      latitude: latitude,
      longitude: longitude,
      mapLink: this.mapLink
    });
    let chatMessage: IMessage = {
      role: 'user',
      msgText: undefined,
      image: undefined,
      type: 'text',
      location:this.mapLink
    };
    // this.chatList.push(fu);
    this.chatMessages.push(chatMessage);
    this.chatMessages.push(chatMessage);
  }

  error() {
    this.status = "Unable to retrieve your location";
  }


}
