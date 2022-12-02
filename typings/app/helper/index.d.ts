// This file is created by egg-ts-helper@1.33.0
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportResponse from '../../../app/helper/response';
import ExportMali from '../../../app/helper/mail';

declare module 'egg' {
    interface IHelper {
        response: ExportResponse;
        mail: ExportMali;
    }
}
