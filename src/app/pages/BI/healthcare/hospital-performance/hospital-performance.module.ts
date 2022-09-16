import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HospitalPerformancePageRoutingModule } from './hospital-performance-routing.module';

import { HospitalPerformancePage } from './hospital-performance.page';
import { ShareModule } from 'src/app/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    HospitalPerformancePageRoutingModule
  ],
  declarations: [HospitalPerformancePage]
})
export class HospitalPerformancePageModule {}
