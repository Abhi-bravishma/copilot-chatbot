import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { CopiloServiceService } from '../copilo-service.service';
import { Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { AdaptiveCard, HostConfig } from 'adaptivecards';
import { Socket } from 'ngx-socket-io';

type User = 'user' | 'bot';

interface IMessage {
  role: User;
  msgText: any;
  image: any;
  type: 'text' | 'image' | any;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  preserveWhitespaces: true,
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
    // clear timeout, reset timer
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
  popUp = false;
  image: File | null = null;
  fileName: string | undefined;
  // scrolllLeft = false;
  // scrolllright = true;
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
  chatMessages: IMessage[] = [];
  lastMessage: { role: string; msg: string } | null = null;
  constructor(private sanitzer: DomSanitizer, private socket: Socket) {}
  //for http safe requests
  receivedImage: any;

  getSafeHtml(html: string) {
    return this.sanitzer.bypassSecurityTrustHtml(html);
  }

  async ngOnInit() {
    this.startInactivityTimer();
    this.socket.on('connect', () => {
      console.log('connected to server');
    });

    this.socket.on('message', (data: any) => {
      console.log('avayaREsp--------> ', data);
      let chatMessage: IMessage = {
        role: data.role,
        msgText: data.msg,
        image: undefined,
        type: 'text',
      };
      // this.chatList.push(fu);
      this.chatMessages.push(chatMessage);
    });
    this.socket.on('imageResponse', (imageName: any) => {
      console.log('Received image name:', imageName);
      this.receivedImage = imageName.image;
      let chatMessage: IMessage = {
        role: imageName.role,
        msgText: undefined,
        image: imageName.image,
        type: 'image',
      };
      this.chatMessages.push(chatMessage);

      console.log('this.chatMessages', this.chatMessages);
    });
  }

  // constructWebSocketURL(): void {
  //   const url = this.socketUrl;
  //   // console.log('fu', url);
  //   // Establish WebSocket connectionng
  //   this.ws = new WebSocket(url);

  //   this.count = 0;

  //   // WebSocket event listeners
  //   this.ws.onopen = (s) => {
  //     console.log('s==> ', s);

  //     console.log('WebSocket connection established');
  //     this.sendInitialMessege(this.conversionDetails);
  //   };

  //   // const eventData = JSON.parse(event.data);
  //   this.ws.onmessage = (event) => {
  //     // console.log('Received message:', event);
  //     console.log(
  //       'Received message:'
  //       // JSON.stringify(JSON.parse(event.data)['activities'][0].text)
  //     );

  //     // this.chatList.push(JSON.parse(event.data)['activities'][0]);
  //     let eventData = event.data ? JSON.parse(event.data) : null;
  //     // console.log('eventData', eventData);

  //     if (eventData && eventData?.activities[0]?.attachments?.length > 0) {
  //       let acData = eventData?.activities[0]?.attachments[0];
  //       console.log('acData', acData);

  //       const adaptiveCard = new AdaptiveCard();
  //       adaptiveCard.hostConfig = new HostConfig({
  //         fontFamily: 'Segoe UI, Helvetica Neue, sans-serif',
  //         // other host config options
  //       });

  //       // adaptiveCard.onExecuteAction = this.onEventOccurred.bind(this);
  //       adaptiveCard.onExecuteAction = function (action: any) {
  //         console.log('kem cho bhai');
  //       };
  //       adaptiveCard.parse(acData?.content);

  //       // Render card to HTML
  //       const renderedCard = adaptiveCard.render();
  //       console.log(
  //         'renderedCard====> ',
  //         JSON.stringify(renderedCard?.innerHTML)
  //       );
  //       acData.html = renderedCard?.innerHTML;
  //     }

  //     // eventData && this.chatList.push(eventData?.activities[0]);

  //     let fu2 =
  //       eventData?.activities[0].type === 'message' &&
  //       eventData?.activities[0].from.role === 'user'
  //         ? eventData?.activities[0].text
  //         : null;

  //     if (fu2) {
  //       console.log('fu2=============================> ', fu2);
  //     }

  //     // if (
  //     //   eventData?.activities[0].type === 'event' &&
  //     //   eventData?.activities[0].value === 'connectToAgent'
  //     // ) {
  //     //   this.chatListT0Agent.push(eventData?.activities[0].from);
  //     //   console.log('connectToAgentUrl', this.chatListT0Agent)
  //     //  ;
  //     // this.chatList
  //     //   .filter((ele: any) => ele.type === 'message')
  //     //   .map((ele: any) => {
  //     //     if (ele.from.role === 'user') {
  //     //       this.lastMessage = { role: ele.from.role, msg: ele.text };
  //     //     }
  //     //     // this.chatListT0Agent.push({
  //     //     //   role: ele.from.role,
  //     //     //   name: ele.from.name,
  //     //     //   msg: ele.text,
  //     //     // });
  //     //   });
  //     // if (this.lastMessage) {
  //     //   this.chatListT0Agent.length = 0; // Clear existing messages (optional)
  //     //   this.chatListT0Agent.push(this.lastMessage);
  //     //   this.socket.emit('chatListT0Agent', this.lastMessage);
  //     //   console.log('helloooo');
  //     //   this.count++;
  //     //   console.log(
  //     //     'counting-------------------------------------> ',
  //     //     this.count
  //     //   );
  //     // }
  //     // console.log('chatListT0Agent', this.chatListT0Agent);

  //     // this.socket.emit('chalist', this.chatListT0Agent);

  //     setTimeout(() => {
  //       this.messageContainer.nativeElement.scrollTop =
  //         this.messageContainer.nativeElement.scrollHeight -
  //         this.messageContainer.nativeElement.clientHeight;
  //     }, 1);

  //     // 909572fe-96ba-43a4-87d3-e05abe0a8545
  //     // 909572fe-96ba-43a4-87d3-e05abe0a8545

  //     // console.log('fu-=> ', this.chatList);

  //     eventData?.activities[0]?.suggestedActions?.actions?.map((ele: any) => {
  //       console.log('🧐', ele.value);
  //       this.connectToAgentUrl = this.sanitzer.bypassSecurityTrustResourceUrl(
  //         ele.value
  //       );
  //     });
  //     eventData?.activities[0]?.suggestedActions?.actions?.map((ele: any) =>
  //       console.log('🧐', ele.type)
  //     );

  //     const message = eventData?.activities[0]?.attachments[0]?.content;
  //     if (message?.images && message?.images.length > 0) {
  //       this.userImage = this.sanitzer.bypassSecurityTrustResourceUrl(
  //         message.images[0]?.url
  //       );
  //       console.log('image', this.userImage);
  //     }

  //     // extract rating
  //     // this.rating =
  //     //   eventData?.activities[0]?.attachments[0]?.content.body[1].columns.map(
  //     //     (ele: any) => ele.items[0].selectAction.data.rate
  //     //   );
  //     // console.log('msg', this.rating);

  //     //   eventData?.activities[0]?.suggestedActions?.attachments?.map((ele: any) =>
  //     //   console.log('jjjjj', ele.content)
  //     // );

  //     // const attachments = eventData?.activities[0]?.attachments[0]?.content;
  //     // console.log('abhi', attachments);

  //     // const adaptiveCard = new AdaptiveCard();
  //     // adaptiveCard.hostConfig = new HostConfig({
  //     //   fontFamily: 'Segoe UI, Helvetica Neue, sans-serif',
  //     //   // other host config options
  //     // });

  //     // adaptiveCard.parse(attachments);

  //     // // Render card to HTML
  //     // const renderedCard = adaptiveCard.render();
  //     // console.log('renderedCard====> ', renderedCard);

  //     // Now you can display renderedCard in your template

  // let fu = document.getElementsByClassName('anchor')[0];

  // fu.scrollIntoView({
  //   behavior: 'smooth',
  //   block: 'end',
  //   inline: 'nearest',
  // });

  //     // this.chatList=jsonstring;
  //     // console.log('Received message:', event);
  //   };

  //   this.ws.onerror = (error) => {
  //     console.error('WebSocket error:', error);
  //   };

  //   this.ws.onclose = () => {
  //     console.log('WebSocket connection closed');
  //   };
  // }

  //send message to  copilot

  sendMessage() {
    const message = this.messageInputText.nativeElement.value.trim();
    console.log('message', typeof message);

    if (!message && !this.fileInput.nativeElement.files?.length) {
      // Neither text nor image is entered
      console.log('No text or image entered.');
      return;
    }

    if (message) {
      this.socket.emit('message', message);
      console.log('mess============> ', message);
      let chatMessage: IMessage = {
        role: 'user',
        msgText: message,
        image: undefined,
        type: 'text',
      };
      this.chatMessages.push(chatMessage);
      console.log('this.chatMessages', this.chatMessages);

      this.messageInputText.nativeElement.value = '';
    }

    if (this.fileInput.nativeElement.files?.length) {
      
      const file = this.fileInput.nativeElement.files[0];
      console.log('filetypw', file);

      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        this.socket.emit('userImage', bytes);
        const binaryString = this.uint8ArrayToBinaryString(bytes);

        const base64Image = btoa(binaryString);
        if (file.type.includes('image')) {
          const dataURL = `data:image;base64,${base64Image}`;
          let chatMessage: IMessage = {
            role: 'user',
            msgText: undefined,
            image: dataURL,
            type: file.type,
          };
          this.chatMessages.push(chatMessage);
        } else {
          const dataURL = `data:video/mp4;base64,${base64Image}`;
          let chatMessage: IMessage = {
            role: 'user',
            msgText: undefined,
            image: dataURL,
            type: file.type,
          };
          this.chatMessages.push(chatMessage);
        }
        // this.receivedImage = dataURL;
        console.log('mess============> ', bytes);

        console.log('this.chatMessages', this.chatMessages);
      };
      reader.readAsArrayBuffer(file);
      this.fileInput.nativeElement.value = '';
    }
    this.fileName = undefined;
    // messageInput && (messageInput.value = '');

    setTimeout(() => {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight -
        this.messageContainer.nativeElement.clientHeight;
    }, 1);
  }

  // to get the details live conversationId and needed deatils through token

  uploadImage() {}

  //code for the bot popup and all

  lll() {
    this.botprofile.nativeElement.style.display = 'initial';
  }

  closepopup() {
    this.popUp = !this.popUp;
    this.botprofile.nativeElement.class = 'none';
  }

  scrollRight() {
    this.actionsContainer.nativeElement.scrollLeft += 100;
    // this.scrolllLeft = !this.scrolllLeft;
    // this.scrolllright = !this.scrolllright;
  }
  scrollLeft() {
    this.actionsContainer.nativeElement.scrollLeft -= 100;
  }

  onEventOccurred(event: any) {
    // console.log(event);
    console.log('adaptive card btn clicked');
  }

  //scroll buttons of card
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

  //popups if user sits ideal
  // openLiveChat() {
  //   // open live chat
  //   this.sendMessage('Talk to agent');
  //   this.isUserInactive = false;
  // }

  // restartConversation() {
  //   // restart conversation
  //   this.sendMessage('start over');
  //   this.isUserInactive = false;
  // }

  // closeConversation() {
  //   this.sendMessage('thank you');
  //   // close conversation
  //   this.isUserInactive = false;
  // }

  onImageSelected(event: any) {
    // Handle image selection
    this.image = event.target.files[0];
    const fileType = this.image?.type.startsWith('image/') ? 'image' : 'video';
    console.log('this.image', fileType);

    if (this.image) {
      this.fileName = this.image.name;
    } else {
      this.fileName = undefined;
    }
  }

  uint8ArrayToBinaryString(uint8Array: Uint8Array): string {
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    return binaryString;
  }
  onFileDropped(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        // Emit the image data via socket
        this.socket.emit('userImage', bytes);
        console.log('Image sent:', file.name);

        // Display the image in the chat
        const dataURL = `data:image/png;base64,${btoa(
          this.uint8ArrayToBinaryString(bytes)
        )}`;
        let chatMessage: IMessage = {
          role: 'user',
          msgText: undefined,
          image: dataURL,
          type: 'image',
        };
        this.chatMessages.push(chatMessage);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }
}
