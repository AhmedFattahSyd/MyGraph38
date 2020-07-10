import { MpgItemType } from "./MpgItemType";
import { v4 as uuid } from "uuid";

export default class MpgRootItem {
  protected _type: MpgItemType;
  public get type(): MpgItemType {
    return this._type;
  }

  private _id: string;
  public get id(): string {
    return this._id;
  }

  constructor(id: string) {
    if (id === "") {
      this._id = uuid();
    } else {
      this._id = id;
    }
    this._type = MpgItemType.Root;
  }
}
