export enum RCode {
  OK,
  FAIL,
  ERROR
}

export class Echo {
  code: number;
  data: string;
  msg: string;
  constructor(code = 0, data = null, msg = '操作成功') {
    this.code = code;
    this.msg = msg;
    this.data = data;
  }
}