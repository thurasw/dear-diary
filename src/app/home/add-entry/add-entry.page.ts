import { Component, Input, OnInit } from '@angular/core';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { ModalController } from '@ionic/angular';
import { StorageService } from 'src/app/storage.service';
import { Subscription, timer } from "rxjs";
import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Insomnia } from '@ionic-native/insomnia/ngx';

@Component({
  selector: 'app-add-entry',
  templateUrl: './add-entry.page.html',
  styleUrls: ['./add-entry.page.scss'],
  animations: [
    trigger("sound-bar", [
      transition(":enter", [
        style({ height: "{{previousBarWidth}}px" }),
        animate('150ms ease-out', style({ height: "*" })),
      ], {params: { previousBarWidth: "8px" }})
    ])
  ]
})
export class AddEntryPage implements OnInit {

  private modal: HTMLIonModalElement;

  @Input() type: string;
  today = Date.now();
  mediaFile: MediaObject;
  fileUrl: string;

  timer: Subscription;
  duration: number = 0;
  amplitude: number[] = new Array(70).fill(8);

  isRecording: boolean;
  entryForm: FormGroup;

  constructor(
    private storage: StorageService,
    private modalCtrl: ModalController,
    private media: Media,
    private formBuilder: FormBuilder,
    private insomnia: Insomnia
  ) { }

  ngOnInit() {
    this.entryForm = this.formBuilder.group({
      title: ""
    })

    this.insomnia.keepAwake();

    this.storage.createNewFile(this.type, this.today.toString(), this.type)
    .then((url) => {
      this.fileUrl = url;

      this.mediaFile = this.media.create(url.replace(/^file:\/\//, ''));
      this.mediaFile.startRecord();
      this.isRecording = true;

      this.timer = timer(0, 100).subscribe((elapsedCycles) => {
        if (this.isRecording) {
          this.duration += 0.1;
          this.mediaFile.getCurrentAmplitude()
          .then((amp) => {
            if (amp < 0.08) amp = 0.08;
            this.amplitude.push(amp*100);
          })
          .catch(err => {
            console.log("Error getting amp: ", err);
          })
        }
      })
    })
    .catch((err) => {
      console.log("Create ERR: ", err);
    })

    this.modal.onWillDismiss()
    .then(() => {
      this.cleanup();
      if (this.entryForm.value.title) {
        this.storage.setFileName(this.fileUrl, this.entryForm.value.title, this.type);
      }
    });
  }

  toggleRecord() {
    if (this.isRecording) {
      this.isRecording = false;
      this.insomnia.allowSleepAgain();
      this.mediaFile.pauseRecord();
    }
    else {
      this.isRecording = true;
      this.insomnia.keepAwake();
      this.mediaFile.startRecord();
    }
  }

  cleanup() {
    this.timer.unsubscribe();
    this.insomnia.allowSleepAgain();

    if (this.mediaFile) {
      this.mediaFile.stopRecord();
      this.mediaFile.release();
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  getPreviousBarWidth() {
    return this.amplitude[this.amplitude.length-1];
  }

}
