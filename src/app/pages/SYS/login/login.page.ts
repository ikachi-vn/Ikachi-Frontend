import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageBase } from 'src/app/page-base';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { AccountService } from '../../../services/account.service';
import { EnvService } from 'src/app/services/core/env.service';
import { ActivatedRoute } from '@angular/router';
import { BRA_BranchProvider } from 'src/app/services/static/services.service';
import { CommonService } from 'src/app/services/core/common.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import * as _ from 'lodash'; 
import { CustomService } from 'src/app/services/custom.service';
import { environment } from 'src/environments/environment';

var URLSearchParams: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage extends PageBase {
    email: string = '';
    password: string = '';
    formGroup: FormGroup;
    submitAttempt = false;
    returnUrl: string;
    showForgotPassword = false;
    partnerList = [];
    randomImg = '';

    constructor(

        public pageProvider: CustomService,
        public accountService: AccountService,
        public env: EnvService,
        public partnerProvider: BRA_BranchProvider,

        public navCtrl: NavController,
        public formBuilder: FormBuilder,
        public loadingCtrl: LoadingController, 
        public route: ActivatedRoute,
        public commonService: CommonService,
    ) {
        super();
        

        if (this.env.user && this.env.user.Id) {
            this.preLoadData();
        }
        this.formGroup = formBuilder.group({
            UserName: ['', Validators.compose([Validators.required])],
            Password: ['', Validators.compose([Validators.required])]
        });

        this.route.fragment.subscribe((fragment: string) => {
            if(!fragment)
                return;
            let external_access_token = fragment.match(/(?:external_access_token)\=([\S\s]*?)\&/)[1];
            let provider = fragment.match(/(?:provider)\=([\S\s]*?)\&/)[1];
            if(provider && external_access_token)
                this.ObtainLocalAccessToken(provider, external_access_token);
        })
    }

    events(e){
        if(e.Code == 'app:loadedLocalData'){
            this.preLoadData();
        }
    }

    preLoadData() {
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        
        if (this.env.user && this.env.user.Id) {
            this.nav( this.returnUrl, 'back');
        }

        this.env.getStorage('Username').then(v=>{
            this.email = v;
        })
    }

    goBack() {
        this.nav( this.returnUrl, 'back');
        //this.navCtrl.back();
    }

    forgotPassword() {
        this.loadingCtrl.create({
            message: 'Vui l??ng ch??? g???i email...'
        }).then(loading => {
            loading.present();

            this.accountService.forgotPassword(this.email)
                .then(data => {
                    loading.dismiss();
                    let message = 'H??? th???ng ???? g???i email b???o m???t ????? thay ?????i m???t kh???u. \nVui l??ng ki???m tra email v?? l??m theo h?????ng d???n.';
                    this.env.showMessage(message, 'warning', 0, true);
                })
                .catch(err => {
                    loading.dismiss();
                    let message = '';
                    if (err.error && typeof (err.error.loaded) == 'number' && err.error.loaded == 0) {
                        message = 'Kh??ng k???t n???i ???????c server, vui l??ng th??? l???i sau.'
                    } else if (err.status == 404) {
                        message = 'Kh??ng t??m th???y email, vui l??ng ki???m tra l???i.'
                    }
                    else {
                        message = 'G???i email kh??ng th??nh c??ng, vui l??ng th??? l???i.';
                    }
                    this.env.showMessage(message);
                });
        })
    }

    
    login() {
        if(this.email.indexOf('@')==-1){
            this.email += environment.loginEmail;
        }
        this.submitAttempt = true;
        if (!this.formGroup.valid) {
            return;
        }

        this.loadingCtrl.create({
            message: 'Vui l??ng ch??? ????ng nh???p v?? ?????ng b??? d??? li???u...'
        }).then(loading => {
            loading.present();
            this.accountService.login(this.email, this.password)
                .then(data => {
                    loading.dismiss();
                    this.goBack();
                })
                .catch(err => {
                    loading.dismiss();
                    let message = '';
                    if (err.error && typeof (err.error.loaded) == 'number' && err.error.loaded == 0) {
                        message = 'Kh??ng k???t n???i ???????c server, vui l??ng th??? l???i sau.'
                    } else if (err.error && err.error.error_description && err.error.error_description.indexOf("locked out") > -1) {
                        message = 'T??i kho???n ch??a k??ch ho???t ho???c ??ang b??? kh??a.'
                    } else if (err.error && err.error.error_description && err.error.error_description.indexOf("user name or password is incorrect") > -1) {
                        message = 'T??n ????ng nh???p ho???c m???t kh???u kh??ng ????ng, vui l??ng th??? l???i.'
                    }
                    else {
                        message = '????ng nh???p kh??ng th??nh c??ng, vui l??ng th??? l???i.';
                    }
                    this.env.showMessage(message, 'danger');
                });
        })
    }

    ObtainLocalAccessToken(provider, externalAccessToken){
        this.loadingCtrl.create({
            message: 'Vui l??ng ch??? ????ng nh???p v?? ?????ng b??? d??? li???u...'
        }).then(loading => {
            loading.present();

            this.accountService.ObtainLocalAccessToken(provider, externalAccessToken)
                .then(data => {
                    loading.dismiss();
                    this.goBack();
                })
                .catch(err => {
                    loading.dismiss();
                    let message =  '????ng nh???p kh??ng th??nh c??ng, vui l??ng th??? l???i.';
                    
                    this.env.showMessage(message);
                });
        })
    }

    facebooklogin() {
        //TODO: facebook login
		//http://bitoftech.net/2014/08/11/asp-net-web-api-2-external-logins-social-logins-facebook-google-angularjs-app/
		//https://stackoverflow.com/questions/21065648/asp-net-web-api-2-how-to-login-with-external-authentication-services
		//1. GET /api/Account/ExternalLogins?returnUrl=%2F&generateState=true
		// => call Facebook provider URL
        //2. Redirected to http://hungvq-w10.local:54009/BOOKING/login#external_access_token=ggg&provider=Facebook&haslocalaccount=True&external_user_name=H??ng%20V??
        // => g???i ObtainLocalAccessToken => l???y token.



        this.loadingCtrl.create({
            message: 'Vui l??ng ch??? ????ng nh???p v?? ?????ng b??? d??? li???u...'
        }).then(loading => {
            loading.present();

            this.accountService.getExternalLogins()
                .then((data: [any]) => {

                    var it = data.filter(ite => ite.Name == 'Facebook');
                    if (it.length) {
                        let ExternalLoginURL = ApiSetting.mainService.base + it[0].Url;
                        window.location.replace(ExternalLoginURL);
                        //Sau khi pass chalenge l???y fragment t??? URL redirect v??? v?? g???i ObtainLocalAccessToken(string provider, string externalAccessToken) ????? l???y token.
                        //xem ti???p preLoadData()
                    }
                    loading.dismiss();
                    // this.goBack();
                })
                .catch(err => {
                    loading.dismiss();
                    let message = '????ng nh???p kh??ng th??nh c??ng, vui l??ng th??? l???i.';

                    this.env.showMessage(message, 'danger');
                });
        });
    }

    googlelogin(){
        this.loadingCtrl.create({
            message: 'Vui l??ng ch??? ????ng nh???p v?? ?????ng b??? d??? li???u...'
        }).then(loading => {
            loading.present();

            this.accountService.getExternalLogins()
                .then((data: [any]) => {

                    var it = data.filter(ite => ite.Name == 'Google');
                    if (it.length) {
                        let ExternalLoginURL = ApiSetting.mainService.base + it[0].Url;
                        window.location.replace(ExternalLoginURL);
                        //Sau khi pass chalenge l???y fragment t??? URL redirect v??? v?? g???i ObtainLocalAccessToken(string provider, string externalAccessToken) ????? l???y token.
                        //xem ti???p preLoadData()
                    }
                    loading.dismiss();
                    // this.goBack();
                })
                .catch(err => {
                    loading.dismiss();
                    let message = '????ng nh???p kh??ng th??nh c??ng, vui l??ng th??? l???i.';

                    this.env.showMessage(message);
                });
        });
    }

    ionViewWillEnter() {
        super.ionViewWillEnter();
        this.env.publishEvent({Code: 'app:ShowMenu', Value: false});
    }

    ionViewDidEnter() {
        super.ionViewDidEnter();
    }

    ionViewWillLeave() {
        this.env.publishEvent({Code:'app:ShowMenu',Value: true});
    }


}
