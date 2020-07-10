import MpgViewableItem from "./MpgViewableItem";
import { MpgItemType } from "./MpgItemType";

export default class MpgItem extends MpgViewableItem {
  constructor(id: string, headline: string) {
    super(id, MpgItemType.Item, headline);
  }

  private _notes: string = "";
  public get notes(): string {
    return this._notes;
  }
  public set notes(value: string) {
    this._notes = value;
  }

  getShortHeadline = () => {
    let shortHeadline = this.headline.substring(0, 20);
    if (shortHeadline.length < this.headline.length) {
      shortHeadline += "...";
    }
    return shortHeadline;
  };
}
