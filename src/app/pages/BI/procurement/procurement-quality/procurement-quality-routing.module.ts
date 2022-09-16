import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProcurementQualityPage } from './procurement-quality.page';

const routes: Routes = [
  {
    path: '',
    component: ProcurementQualityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcurementQualityPageRoutingModule {}
