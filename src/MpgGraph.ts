import MpgItem from "./MpgItem";

export enum MessageType {
  Information = "Information",
  Error = "Error",
}

export default class MpgGraph {
  private items = new Map<string, MpgItem>();
  private refreshData: Function;

  constructor(refreshData: Function) {
    this.refreshData = refreshData;
  }

  public createNewItem = async (headline: string) => {
    try {
      const item = new MpgItem("", headline);
      this.items.set(item.id, item);
      await this.invokeRefreshData();
      return item.id;
    } catch (error) {
      throw error;
    }
  };

  private invokeRefreshData = async () => {
    await this.refreshData(this.items);
  };

  public initialise = () => {};
  
}
