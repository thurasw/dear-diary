import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddEntryPageRoutingModule } from './add-entry-routing.module';

import { AddEntryPage } from './add-entry.page';
import { AudioDurationPipe } from 'src/app/app.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddEntryPageRoutingModule
  ],
  declarations: [AddEntryPage, AudioDurationPipe]
})
export class AddEntryPageModule {}
