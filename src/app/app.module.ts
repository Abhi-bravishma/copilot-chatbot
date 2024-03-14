import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './chat/chat.component';
// import 'adaptivecards/lib/adaptivecards.css';
// import 'adaptivecards-designer/dist/adaptivecards-designer.css';
// import 'adaptivecards-designer/dist/adaptivecards-defaulthost.css';

@NgModule({
  declarations: [AppComponent, ChatComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
