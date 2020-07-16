import MpgViewableItem from "./MpgViewableItem";
import { MpgItemType } from "./MpgItemType";
import * as firebase from "firebase/app";

export enum MpgItemState {
  Active = "Active",
  Parked = "Parked",
  Archived = "Archived",
  Done = "Done",
}

export enum MpgItemPrivacy {
  Public = "Public",
  Community = "Community",
  Personal = "Personal",
  Private = "Private",
}

export default class MpgItem extends MpgViewableItem {

  constructor(
    id: string,
    headline: string,
    notes: string = "",
    createAt: Date = new Date(),
    updatedAt: Date = new Date(),
    priority: number = 0,
    state: MpgItemState = MpgItemState.Active,
    parkedUntil: Date = new Date(),
    sentiment: number = 0
  ) {
    super(id, MpgItemType.Item, headline);
    this._priority = priority;
    this._notes = notes;
    this._createdAt = createAt;
    this._updateAt = updatedAt;
    this.state = state;
    this.parkedUntil = parkedUntil;
    this.sentiment = sentiment;
  }

  public get netPriority(): number {
    let netPriority = this.priority;
    // this.tagRels.forEach((tagRel) => {
    //   netPriority += tagRel.tag.priority;
    // });
    return netPriority;
  }

  private _priority: number = 0;
  public get priority(): number {
    return this._priority;
  }
  public set priority(value: number) {
    this._priority = value;
  }

  private _sentiment = 0;
  public get sentiment() {
    return this._sentiment;
  }
  public set sentiment(value) {
    this._sentiment = value;
  }

  private _overrideSentiment = false;
  public get overrideSentiment() {
    return this._overrideSentiment;
  }
  public set overrideSentiment(value) {
    this._overrideSentiment = value;
  }

  private _state = MpgItemState.Active;

  public get state() {
    // check date and change parked state if time is out
    if (this._state === MpgItemState.Parked) {
      const now = new Date();
      if (this.parkedUntil < now) {
        this._state = MpgItemState.Active;
      }
    }
    return this._state;
  }

  getItemData = (): MpgItemData => {
    const itemData: MpgItemData = {
      headline: this.headline,
      notes: this.notes,
      type: this.type,
      priority: this.priority,
      createdAt: firebase.firestore.Timestamp.fromDate(this.createdAt),
      updatedAt: firebase.firestore.Timestamp.fromDate(this.updatedAt),
      state: this.state,
      parkedUntil: firebase.firestore.Timestamp.fromDate(this.parkedUntil),
      sentiment: this.sentiment,
      overrideSentiment: this.overrideSentiment,
      privacy: this.privacy,
    };
    return itemData;
  };

  private _parkUntil: Date = new Date();
  public get parkedUntil(): Date {
    return this._parkUntil;
  }
  public set parkedUntil(value: Date) {
    this._parkUntil = value;
  }

  public set state(newState: MpgItemState) {
    this._state = newState;
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

  private _createdAt: Date;
  public get createdAt(): Date {
    return this._createdAt;
  }
  public set createdAt(value: Date) {
    this._createdAt = value;
  }

  private _updateAt: Date;
  public get updatedAt(): Date {
    return this._updateAt;
  }
  public set updatedAt(value: Date) {
    this._updateAt = value;
  }

  private _privacy = MpgItemPrivacy.Personal;
  public get privacy() {
    return this._privacy;
  }
  public set privacy(value) {
    this._privacy = value;
  }

  public static fromItemData = (id: string, data: MpgItemData): MpgItem => {
    let state = MpgItemState.Active
    let parkUntil: Date = new Date()
    if(data.state !== undefined){
      state = data.state
    }
    if(data.parkedUntil !== undefined){
      parkUntil = data.parkedUntil.toDate()
    }
    let sentiment = 0
    if(data.sentiment !== undefined){
      sentiment = data.sentiment
    }
    let item = new MpgItem(
      id,
      data.headline,
      data.notes,
      data.createdAt.toDate(),
      data.updatedAt.toDate(),
      data.priority,
      state,
      parkUntil,
      sentiment,
    );
    if(data.overrideSentiment !== undefined){
      item.overrideSentiment = data.overrideSentiment
    }else{
      item.overrideSentiment = false
    }
    if(data.privacy !== undefined){
      item.privacy = data.privacy
    }else{
      item.privacy = MpgItemPrivacy.Public
    }
    return item;
  };
}

export interface MpgItemData {
  headline: string;
  notes: string;
  type: MpgItemType;
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
  priority: number;
  // add state and parked until
  state: MpgItemState;
  parkedUntil: firebase.firestore.Timestamp;
  sentiment: number;
  overrideSentiment: boolean;
  privacy: MpgItemPrivacy;
}
