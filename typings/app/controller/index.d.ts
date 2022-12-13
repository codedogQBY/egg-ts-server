// This file is created by egg-ts-helper@1.33.0
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportFile from '../../../app/controller/file';
import ExportHome from '../../../app/controller/home';
import ExportMenu from '../../../app/controller/menu';
import ExportRole from '../../../app/controller/role';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    file: ExportFile;
    home: ExportHome;
    menu: ExportMenu;
    role: ExportRole;
    user: ExportUser;
  }
}
