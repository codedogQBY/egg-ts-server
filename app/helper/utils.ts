import { Models } from '../type/model';
import moment from 'moment';

class UtilsHelper {
  public format(date: Date, pattern = 'YYYY-MM-DD HH:mm:ss') {
    return moment(date).format(pattern);
  }
  public getTreeByList(list: Models.List, rootId: number, options?: Models.TreeOption) {
    // 属性配置设置
    const attr = {
      id: options?.id || 'id',
      parentId: options?.parentId || 'parentId',
      rootId,
    };
    const toTreeData = (
      data: Models.List,
      attr: {
        id: string
        parentId: string
        rootId: number
      },
    ) => {
      const tree: Models.TreeNode[] = [];
      const resData = data;
      for (let i = 0; i < resData.length; i++) {
        if (resData[i].parentId === attr.rootId) {
          const obj = {
            ...resData[i],
            id: resData[i][attr.id],
            children: [],
          };
          tree.push(obj);
          resData.splice(i, 1);
          i--;
        }
      }
      const run = (treeArrs: Models.List[]) => {
        if (resData.length > 0) {
          for (let i = 0; i < treeArrs.length; i++) {
            for (let j = 0; j < resData.length; j++) {
              if (treeArrs[i].id === resData[j][attr.parentId]) {
                const obj = {
                  ...resData[j],
                  id: resData[j][attr.id],
                  children: [],
                };
                treeArrs[i].children.push(obj);
                resData.splice(j, 1);
                j--;
              }
            }
            run(treeArrs[i].children);
          }
        }
      };
      run(tree);
      return tree;
    };
    const arr = toTreeData(list, attr);
    return arr;
  }

  public sort(arr: any[], propName: string, type: Models.SortType) {
    arr.sort((a, b) => {
      if (type === 'asc') {
        return b[propName] - a[propName];
      }
      return a[propName] - b[propName];

    });
  }

  public lineToHump(str: string): string {
    if (str.startsWith('_')) {
      return str;
    }
    return str.replace(/\_(\w)/g, (_all, letter: string) => letter.toUpperCase());
  }

  public isValidKey(key: string | number | symbol, object: object): key is keyof typeof object {
    return key in object;
  }

  public lineToHumpObject(obj) {
    let key: string;
    const element: {
      [key: string]: any
    } = {};
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (this.isValidKey(key, obj)) {
          const value = obj[key];
          if (typeof key === 'string' && (key as string).indexOf('_at') > -1) {
            element[this.lineToHump(key)] = this.format(value);
          } else {
            element[this.lineToHump(key)] = value;
          }
        }
      }
    }
    return {
      ...element,
    };
  }
}
export default new UtilsHelper();
