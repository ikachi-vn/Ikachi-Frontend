import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { PURCHASE_OrderProvider, SYS_StatusProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { lib } from 'src/app/services/static/global-functions';
import { ApiSetting } from 'src/app/services/static/api-setting';

@Component({
    selector: 'app-purchase-order',
    templateUrl: 'purchase-order.page.html',
    styleUrls: ['purchase-order.page.scss']
})
export class PurchaseOrderPage extends PageBase {
    statusList = [];
    paymentStatusList = [];

    constructor(
        public pageProvider: PURCHASE_OrderProvider,
        public statusProvider: SYS_StatusProvider,
        public modalController: ModalController,
        public alertCtrl: AlertController,
        public loadingController: LoadingController,
        public env: EnvService,
        public navCtrl: NavController,
        public location: Location,
    ) {
        super();
    }

    preLoadData() {
        if (!this.sort.Id) {
            this.sort.Id = 'Id';
            this.sortToggle('Id', true);
        }
        this.statusProvider.read({ Code_eq: 'PURCHASING', AllChildren: true }).then(resp => {
            let poStatus = resp['data'].find(d => d.Code == 'POStatus');
            this.statusList = resp['data'].filter(d => d.IDParent == poStatus.Id);

            let paymentStatus = resp['data'].find(d => d.Code == 'POPaymentStatus');
            this.paymentStatusList = resp['data'].filter(d => d.IDParent == paymentStatus.Id);
            super.preLoadData();
        });

    }

    loadedData() {
        this.items.forEach(i => {
            i.TotalAfterTaxText = lib.currencyFormat(i.TotalAfterTax);
            i.OrderDateText = lib.dateFormat(i.OrderDate, 'dd/mm/yyyy');
            i.OrderTimeText = lib.dateFormat(i.OrderDate, 'hh:MM');
            i.StatusText = lib.getAttrib(i.Status, this.statusList, 'Name', '--', 'Code');
            i.StatusColor = lib.getAttrib(i.Status, this.statusList, 'Color', 'dark', 'Code');
        });
        super.loadedData();
    }

    mergeSaleOrders() {

    }
    splitSaleOrder() {

    }


    submitOrdersForApproval() {
        if (!this.pageConfig.canSubmitOrdersForApproval) return;
        if (this.submitAttempt) return;

        let itemsCanNotProcess = this.selectedItems.filter(i => !(i.Status == 'PODraft' || i.Status == 'PORequestUnapproved'));
        if (itemsCanNotProcess.length == this.selectedItems.length) {
            this.env.showMessage('C??c ????n b???n ch???n kh??ng th??? g???i duy???t. Vui l??ng ch??? ch???n ????n m???i ho???c ????n b??? tr??? l???i.', 'warning')
        }
        else {
            itemsCanNotProcess.forEach(i => {
                i.checked = false;
            });
            this.selectedItems = this.selectedItems.filter(i => (i.Status == 'PODraft' || i.Status == 'PORequestUnapproved'));

            this.env.showPrompt('B???n ch???c mu???n g???i duy???t ' + this.selectedItems.length + ' ????n h??ng ??ang ch???n?', null, 'G???i duy???t ' + this.selectedItems.length + ' mua h??ng')
                .then(_ => {
                    this.submitAttempt = true;
                    let postDTO = { Ids: [] };
                    postDTO.Ids = this.selectedItems.map(e => e.Id);

                    this.pageProvider.commonService.connect('POST', ApiSetting.apiDomain("PURCHASE/Order/SubmitOrdersForApproval/"), postDTO).toPromise()
                        .then((savedItem: any) => {
                            this.env.publishEvent({ Code: this.pageConfig.pageName });
                            this.submitAttempt = false;

                            if (savedItem > 0) {
                                this.env.showMessage(`???? g???i duy???t ${savedItem} ????n!`, 'success');
                            }
                            else{
                                this.env.showMessage('Xin vui l??ng ki???m tra l???i, c??c ????n g???i duy???t ph???i c?? ??t nh???t 1 s???n ph???m.', 'warning');
                            }

                        }).catch(err => {
                            this.submitAttempt = false;
                            console.log(err);
                        });
                });
        }
    }
    approveOrders() {
        if (!this.pageConfig.canApprove) return;
        if (this.submitAttempt) return;

        let itemsCanNotProcess = this.selectedItems.filter(i => !(i.Status == 'PORequestSubmitted'));
        if (itemsCanNotProcess.length == this.selectedItems.length) {
            this.env.showMessage('C??c ????n b???n ch???n kh??ng th??? duy???t. Vui l??ng ch??? ch???n ????n ??ang ch??? duy???t.', 'warning')
        }
        else {
            itemsCanNotProcess.forEach(i => {
                i.checked = false;
            });
            this.selectedItems = this.selectedItems.filter(i => (i.Status == 'PORequestSubmitted'));
            this.env.showPrompt('B???n ch???c mu???n DUY???T ' + this.selectedItems.length + ' ????n h??ng ??ang ch???n?', null, 'Duy???t ' + this.selectedItems.length + ' ????n h??ng')
                .then(_ => {
                    this.submitAttempt = true;
                    let postDTO = { Ids: [] };
                    postDTO.Ids = this.selectedItems.map(e => e.Id);

                    this.pageProvider.commonService.connect('POST', ApiSetting.apiDomain("PURCHASE/Order/ApproveOrders/"), postDTO).toPromise()
                        .then((savedItem: any) => {

                            this.env.publishEvent({ Code: this.pageConfig.pageName });
                            this.submitAttempt = false;

                            if (savedItem > 0) {
                                this.env.showMessage(`???? duy???t ${savedItem} ????n!`, 'success');
                            }
                            else{
                                this.env.showMessage('Xin vui l??ng ki???m tra l???i, c??c ????n duy???t ph???i c?? ??t nh???t 1 s???n ph???m.', 'warning');
                            }

                        }).catch(err => {
                            this.submitAttempt = false;
                            console.log(err);
                        });
                });
        }
    }
    disapproveOrders() {
        if (!this.pageConfig.canApprove) return;
        if (this.submitAttempt) return;

        let itemsCanNotProcess = this.selectedItems.filter(i => !(i.Status == 'PORequestSubmitted' || i.Status == 'PORequestApproved'));
        if (itemsCanNotProcess.length == this.selectedItems.length) {
            this.env.showMessage('C??c ????n b???n ch???n kh??ng th??? tr??? l???i. Vui l??ng ch??? ch???n ????n ??ang ch??? duy???t v?? ????n ???? ???????c duy???t.', 'warning')
        }
        else {
            itemsCanNotProcess.forEach(i => {
                i.checked = false;
            });
            this.selectedItems = this.selectedItems.filter(i => (i.Status == 'PORequestSubmitted' || i.Status == 'PORequestApproved'));
            this.env.showPrompt('B???n ch???c mu???n TR??? L???I ' + this.selectedItems.length + ' ????n h??ng ??ang ch???n?', null, 'Duy???t ' + this.selectedItems.length + ' ????n h??ng')
                .then(_ => {
                    this.submitAttempt = true;
                    let postDTO = { Ids: [] };
                    postDTO.Ids = this.selectedItems.map(e => e.Id);

                    this.pageProvider.commonService.connect('POST', ApiSetting.apiDomain("PURCHASE/Order/DisapproveOrders/"), postDTO).toPromise()
                        .then((savedItem: any) => {
                            this.env.publishEvent({ Code: this.pageConfig.pageName });
                            this.env.showMessage('???? l??u xong!', 'success');
                            this.submitAttempt = false;

                        }).catch(err => {
                            this.submitAttempt = false;
                            console.log(err);
                        });
                });
        }
    }
    cancelOrders() {
        if (!this.pageConfig.canCancel) return;
        if (this.submitAttempt) return;

        let itemsCanNotProcess = this.selectedItems.filter(i => !(i.Status == 'PODraft' || i.Status == 'PORequestUnapproved'));
        if (itemsCanNotProcess.length == this.selectedItems.length) {
            this.env.showMessage('C??c ????n b???n ch???n kh??ng th??? h???y. Vui l??ng ch??? ch???n ????n ??ang ch??? duy???t ho???c ????n nh??p.', 'warning')
        }
        else {
            itemsCanNotProcess.forEach(i => {
                i.checked = false;
            });
            this.selectedItems = this.selectedItems.filter(i => (i.Status == 'PODraft' || i.Status == 'PORequestUnapproved'));
            this.env.showPrompt('B???n ch???c mu???n H???Y ' + this.selectedItems.length + ' ????n h??ng ??ang ch???n?', null, 'Duy???t ' + this.selectedItems.length + ' ????n h??ng')
                .then(_ => {
                    this.submitAttempt = true;
                    let postDTO = { Ids: [] };
                    postDTO.Ids = this.selectedItems.map(e => e.Id);

                    this.pageProvider.commonService.connect('POST', ApiSetting.apiDomain("PURCHASE/Order/CancelOrders/"), postDTO).toPromise()
                        .then((savedItem: any) => {
                            this.env.publishEvent({ Code: this.pageConfig.pageName });
                            this.env.showMessage('???? l??u xong!', 'success');
                            this.submitAttempt = false;

                        }).catch(err => {
                            this.submitAttempt = false;
                            console.log(err);
                        });
                });
        }
    }
}