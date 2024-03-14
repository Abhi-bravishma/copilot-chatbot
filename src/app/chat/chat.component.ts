import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CopiloServiceService } from '../copilo-service.service';
import { Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { AdaptiveCard, HostConfig } from 'adaptivecards';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  preserveWhitespaces: true,
})
export class ChatComponent {
  [x: string]: any;
  private newMessage = new Subject<void>();
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
  // scrolllLeft = false;
  // scrolllright = true;
  connectToAgentUrl: any;
  userImage: any;
  chatList: any = [];
  title = 'copilot';
  ws!: WebSocket;
  message: string = '';
  socketUrl: any;
  conversionDetails: any;

  constructor(private sanitzer: DomSanitizer) {}
    //for http safe requests
  getSafeHtml(html: string) {
    return this.sanitzer.bypassSecurityTrustHtml(html);
  }


  async ngOnInit() {
    this.conversionDetails = await this.getSocketUrl();
    this.socketUrl = this.conversionDetails.streamUrl;
    this.constructWebSocketURL();
  }


  //to create websocket and get the details
  constructWebSocketURL(): void {
    const url = this.socketUrl;
    // console.log('fu', url);
    // Establish WebSocket connectionng
    this.ws = new WebSocket(url);

    // WebSocket event listeners
    this.ws.onopen = (s) => {
      console.log('s==> ', s);

      console.log('WebSocket connection established');
      this.sendInitialMessege(this.conversionDetails);
    };

    // const eventData = JSON.parse(event.data);
    this.ws.onmessage = (event) => {
      // console.log('Received message:', event);
      console.log(
        'Received message:'
        // JSON.stringify(JSON.parse(event.data)['activities'][0].text)
      );

      // this.chatList.push(JSON.parse(event.data)['activities'][0]);
      let eventData = event.data ? JSON.parse(event.data) : null;

      if (eventData && eventData?.activities[0]?.attachments?.length > 0) {
        let acData = eventData?.activities[0]?.attachments[0];
        console.log('acData', acData);

        const adaptiveCard = new AdaptiveCard();
        adaptiveCard.hostConfig = new HostConfig({
          fontFamily: 'Segoe UI, Helvetica Neue, sans-serif',
          // other host config options
        });

        // adaptiveCard.onExecuteAction = this.onEventOccurred.bind(this);
        adaptiveCard.onExecuteAction = function (action: any) {
          console.log('kem cho bhai');
        };
        adaptiveCard.parse(acData?.content);

        // Render card to HTML
        const renderedCard = adaptiveCard.render();
        console.log(
          'renderedCard====> ',
          JSON.stringify(renderedCard?.innerHTML)
        );
        acData.html = renderedCard?.innerHTML;
      }

      eventData && this.chatList.push(eventData?.activities[0]);

      setTimeout(() => {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight -
          this.messageContainer.nativeElement.clientHeight;
      }, 1);

      // 909572fe-96ba-43a4-87d3-e05abe0a8545
      // 909572fe-96ba-43a4-87d3-e05abe0a8545

      console.log('fu-=> ', this.chatList);
      eventData?.activities[0]?.suggestedActions?.actions?.map((ele: any) => {
        console.log('🧐', ele.value);
        this.connectToAgentUrl = this.sanitzer.bypassSecurityTrustResourceUrl(
          ele.value
        );
      });
      eventData?.activities[0]?.suggestedActions?.actions?.map((ele: any) =>
        console.log('🧐', ele.type)
      );
      console.log('audio', eventData?.activities[0]?.attachments[0]?.content);

      const message = eventData?.activities[0]?.attachments[0]?.content;

      if (message?.images && message?.images.length > 0) {
        this.userImage = this.sanitzer.bypassSecurityTrustResourceUrl(
          message.images[0]?.url
        );
        console.log('image', this.userImage);
      }

      //   eventData?.activities[0]?.suggestedActions?.attachments?.map((ele: any) =>
      //   console.log('jjjjj', ele.content)
      // );

      // const attachments = eventData?.activities[0]?.attachments[0]?.content;
      // console.log('abhi', attachments);

      // const adaptiveCard = new AdaptiveCard();
      // adaptiveCard.hostConfig = new HostConfig({
      //   fontFamily: 'Segoe UI, Helvetica Neue, sans-serif',
      //   // other host config options
      // });

      // adaptiveCard.parse(attachments);

      // // Render card to HTML
      // const renderedCard = adaptiveCard.render();
      // console.log('renderedCard====> ', renderedCard);

      // Now you can display renderedCard in your template

      // let fu = document.getElementsByClassName('anchor')[0];

      // fu.scrollIntoView({
      //   behavior: 'smooth',
      //   block: 'end',
      //   inline: 'nearest',
      // });

      // this.chatList=jsonstring;
      // console.log('Received message:', event);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }
   //send message to  copilot
  sendMessage(
    message: any,
    messageInput?: HTMLInputElement,
    suggestedActions?: HTMLDivElement
  ) {
    console.log('mess============> ', message);
    if (message !== '') {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(message);

        this.sendMessageAgain(this.conversionDetails, message);
      } else {
        console.warn('WebSocket connection not open. Cannot send message.');
      }
      // message = '';
      messageInput && (messageInput.value = '');
      suggestedActions && (suggestedActions.style.display = 'none');
      // suggestedActions && suggestedActions.remove(  );
    }
  }
 // to get the details live conversationId and needed deatils through token
  async getSocketUrl() {
    let headersList = {
      Accept: '*/*',
      Authorization:
        // 'Bearer nRkW9WSAFoY.qsrTi92ZljrPGQalhmW0ARz0fM7UKrdmiXefdnJw56s',
        // 'Bearer mcKUYtZZ-5A.SNSxaE9Tb2FcLEtXhLAq-ISgM4LAwiH-dzaAvCAuTZA',
        'Bearer 6mJ1ECPC0dk.hunFtodVEt72En-mSOwQiSLcBabsgjK_zwLVeAYq6U8',
    };

    let response = await fetch(
      'https://directline.botframework.com/v3/directline/conversations',
      {
        method: 'POST',
        headers: headersList,
      }
    );

    let data: any = await response.text();
    return JSON.parse(data);
  }

  async sendMessageAgain(conversionDetails: any, message: string) {
    const { conversationId, streamUrl, token } = conversionDetails;
    // console.log(conversionDetails)
    let headersList = {
      authority: 'directline.botframework.com',
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    };

    let bodyContent = JSON.stringify({
      locale: 'en-EN',
      type: 'message',
      from: {
        id: 'user1',
        role: 'user',
      },
      text: message,
    });

    let response = await fetch(
      `https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`,
      {
        method: 'POST',
        body: bodyContent,
        headers: headersList,
      }
    );

    let data = await response.text();
    console.log(data);
  }
 //it is for the initial message which comes on opening
  async sendInitialMessege(conversionDetails: any) {
    try {
      const { conversationId, token } = conversionDetails;

      let headersList = {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      };
      let bodyContent = JSON.stringify({
        name: 'startConversation',
        type: 'event',
        from: {
          id: '5839aa31-0a18-4ae6-bf9a-074b29de79b3',
          // name: 'C2 User',
          role: 'user',
        },
      });
      let response = await fetch(
        `https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`,
        {
          method: 'POST',
          body: bodyContent,
          headers: headersList,
        }
      );

      let data = await response.text();
      console.log('inital msg send ', data);
    } catch (error) {
      console.log('error in send initial message', error);
    }
  }


   //code for the bot popup and all
  onPopUp() {
    this.popUp = !this.popUp;

    this.botprofile.nativeElement.style.display = 'none';
    this.sendInitialMessege(this.conversionDetails);
  }
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

  scrollPrev() {
    this.carouselContainer.nativeElement.scrollLeft -= 320; 
  }
  
  scrollNext() {
    this.carouselContainer.nativeElement.scrollLeft += 320;
  }
}
