import {
  Component,
  ElementRef,
  HostListener,
  Input,
  SecurityContext,
  ViewChild,
} from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { CopiloServiceService } from '../copilo-service.service';
import { Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { AdaptiveCard, HostConfig } from 'adaptivecards';
import { Socket } from 'ngx-socket-io';

import {
  Message,
  MessageType,
  FileData,
  LocationData,
  UserType,
  ActionType,
} from '../types/message';

// type User = 'user' | 'bot';

// interface IMessage {
//   role: User;
//   msgText: any;
//   image: any;
//   type: 'text' | 'image' | any;
// }

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  preserveWhitespaces: true,
  animations: [
    trigger('popupAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),
        animate(
          '0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
          style({ transform: 'scale(1)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
          style({ transform: 'scale(0.5)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class ChatComponent {
  @HostListener('document:mousemove')
  resetInactivityTimer() {
    clearTimeout(this.inactivityTimer);

    this.startInactivityTimer();
  }

  @HostListener('document:click')
  resetInactivityTimerr() {
    clearTimeout(this.inactivityTimer);
    this.isUserInactive = false;
    this.startInactivityTimer();
  }
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: any) {
    this.resetInactivitytTimer();
  }

  resetInactivitytTimer() {
    clearTimeout(this.inactivityTimer);
    this.isUserInactive = false;
    this.startInactivityTimer();
  }

  [x: string]: any;
  private newMessage = new Subject<void>();

  @ViewChild('messageInput') messageInputText!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @ViewChild('carouselContainer') carouselContainer!: ElementRef;

  @ViewChild('botprofile')
  botprofile!: ElementRef<any>;
  @ViewChild('renderedCard')
  templateData!: ElementRef<any>;

  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('suggestedActionsContainer') actionsContainer!: ElementRef;

  userImages = ['./assets/user.png', './assets/chatbot.png'];
  getUserImage() {
    return this.userImages;
  }

  inputSize: number = 30;
  showChatbot: boolean = false;
  isTyping: boolean = false;
  popUpOpenClose: boolean = false;
  popUpOpenopen: boolean = true;

  popUp = false;
  image: File | null = null;
  fileName: string | undefined;
  connectToAgentUrl: any;
  userImage: any;
  chatList: any = [];
  chatListT0Agent: any = [];
  title = 'copilot';
  ws!: WebSocket;
  agentWebSocket!: WebSocket;
  message: string = '';
  socketUrl: any;
  conversionDetails: any;
  inactivityTimer: any;
  isUserInactive = false;
  rating: any;
  count: number = 0;
  hasSubmittedRating = false;
  chatMessages: Message[] = [];
  sender: string = 'kamlesh';
  typeUser = UserType.Customer;
  typeAgent = UserType.Agent;
  typeSystem = UserType.System;
  messsFile = MessageType.File;
  messageType: typeof MessageType = MessageType;
  actionType: typeof ActionType = ActionType;

  messageTypeText: MessageType.Text | undefined;
  messageTypeImage: MessageType.Image | undefined;
  messageTypeAudio: MessageType.Audio | undefined;
  messageTypeVideo: MessageType.Video | undefined;
  messageTypeFile: MessageType.File | undefined;
  messageTypeLocation: MessageType.Location | undefined;

  lastMessage: { role: string; msg: string } | null = null;

  constructor(private sanitzer: DomSanitizer, private socket: Socket) {}
  receivedImage: any;

  getSafeHtml(html: string) {
    return this.sanitzer.bypassSecurityTrustHtml(html);
  }

  async ngOnInit() {
    this.startInactivityTimer();
    this.socket.on('connect', () => {
      console.log('connected to server');
    });

    this.socket.on('message', (data: Message) => {
      data.sender = 'agent user';
      data.userType = UserType.Agent;
      console.log('avayaREsp--------> ', data);
      setTimeout(() => {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight -
          this.messageContainer.nativeElement.clientHeight;
      }, 1);
      this.chatMessages.push(data);
      console.log('-=-=-=', this.chatMessages);
    });
  }
  uploadImage() {}

  lll() {
    this.botprofile.nativeElement.style.display = 'initial';
  }

  closepopup() {
    this.popUp = !this.popUp;
    this.botprofile.nativeElement.class = 'none';
  }

  scrollRight() {
    this.actionsContainer.nativeElement.scrollLeft += 100;
  }
  scrollLeft() {
    this.actionsContainer.nativeElement.scrollLeft -= 100;
  }

  onEventOccurred(event: any) {
    console.log('adaptive card btn clicked');
  }

  scrollPrev() {
    this.carouselContainer.nativeElement.scrollLeft -= 320;
  }

  scrollNext() {
    this.carouselContainer.nativeElement.scrollLeft += 320;
  }

  startInactivityTimer() {
    this.inactivityTimer = setTimeout(() => {
      this.isUserInactive = true;
    }, 30000); // 3m timeout
  }

  uint8ArrayToBinaryString(uint8Array: Uint8Array): string {
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    return binaryString;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  handleDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    this.handleFile(file);
  }

  handleFileSelect(e: any) {
    const file = e.target.files?.[0];
    this.handleFile(file);
  }

  handleFile(file: File | undefined) {
    console.log('procesing file, ', file);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      let messagePayload: Message;
      const fileData: FileData = {
        name: file.name,
        data: reader.result as string,
        size: file.size,
        contentType: file.type,
        url: '',
      };
      switch (file.type.split('/')[0]) {
        case 'image':
          messagePayload = {
            sender: this.sender,
            userType: UserType.Customer,
            message_type: MessageType.Image,
            [MessageType.Image]: fileData,
          };
          break;
        case 'audio':
          messagePayload = {
            sender: this.sender,
            userType: UserType.Customer,
            message_type: MessageType.Audio,
            [MessageType.Audio]: fileData,
          };
          break;
        case 'video':
          messagePayload = {
            sender: this.sender,
            userType: UserType.Customer,
            message_type: MessageType.Video,
            [MessageType.Video]: fileData,
          };
          break;

        default:
          messagePayload = {
            sender: this.sender,
            userType: UserType.Customer,
            message_type: MessageType.File,
            [MessageType.File]: fileData,
          };
      }
      // console.log('messagePayload===> ', messagePayload);
      this.sendMessage(messagePayload);
    };
    reader.readAsDataURL(file);
  }

  sendText() {
    if (!this.messageInputText.nativeElement.value) return;
    console.log('send text called');
    let messagePayload: Message = {
      sender: this.sender,
      userType: UserType.Customer,
      message_type: MessageType.Text,
      text: this.messageInputText.nativeElement.value,
    };
    this.messageInputText.nativeElement.value = '';

    this.sendMessage(messagePayload);
  }

  sendMessage(messagePayload: Message) {
    console.log('message Payload--> ', messagePayload);
    if (!messagePayload) return;

    try {
      this.socket.emit('message', messagePayload);
      this.chatMessages.push(messagePayload);
    } catch (error) {
      console.log('error  ----------?', error);
    }
  }

  handleSendLocation() {
    if (!navigator.geolocation) {
      return alert('Geolocation is not supported by your browser');
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // https://www.latlong.net/c/?lat=18.5855998&long=73.7830746
        // `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`
        // const fu:any =this.sanitzer.sanitize(SecurityContext.URL,);

        const mapUrl = this.sanitzer.bypassSecurityTrustResourceUrl(
          `https://maps.google.com/maps?q=${latitude}/${longitude}`
        );

        const loc: LocationData = {
          lat: latitude,
          long: longitude,
          url: mapUrl,
        };
        const messagePayload: Message = {
          sender: this.sender,
          userType: UserType.Customer,
          message_type: MessageType.Location,
          [MessageType.Location]: loc,
        };
        this.sendMessage(messagePayload);
      },
      (err) => {
        alert('Unable to fetch your location  ');
        console.log('Unable to fetch your location  --> ', err);
      },
      { enableHighAccuracy: true }
    );
  }

  toggleChatbot(): void {
    this.showChatbot = !this.showChatbot;
    this.popUpOpenClose = !this.popUpOpenClose;
    this.popUpOpenopen = !this.popUpOpenopen;
  }
  closechat() {
    this.showChatbot = false;
  }

  updateInputSize(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto'; // Reset the height to auto to correctly calculate the scroll height
    textarea.style.height = textarea.scrollHeight + 'px';
  }
  onInput(e: any) {
    this.isTyping = e.target.value.trim().length > 0;
  }

  handleEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.shiftKey === false) {
      event.preventDefault();
      this.sendText();
      this.messageInputText.nativeElement.value = '';
      this.messageInputText.nativeElement.style.height = 'auto';
    }
  }
}
