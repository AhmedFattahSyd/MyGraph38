import React from "react";
import {
  AppBar,
  Toolbar,
  Icon,
  Typography,
  Tooltip,
  CircularProgress,
  Snackbar,
  SnackbarContent,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  SwipeableDrawer,
} from "@material-ui/core";
import MpgTheme from "./MpgTheme";
import MpgGraph, {
  MessageType as MpgMessageType,
  MessageType,
} from "./MpgGraph";
import MpgViewableItem from "./MpgViewableItem";
import MpgItemView from "./MpgItemView";
import MpgItem from "./MpgItem";
import { MpgItemType } from "./MpgItemType";
import MpgUser from "./MpgUser";
import MpgViewableItemView from "./MpgViewableItemView";
interface MpgAppProps {}

interface MpgAppState {
  initialLoadInProgress: boolean;
  dataSavingInprogress: boolean;
  messageVisible: boolean;
  message: string;
  messageWaitTime: number;
  messageType: MpgMessageType;
  appErrorState: boolean;
  appError: Error | null;
  debugMode: boolean;
  openItems: Map<string, MpgViewableItem>;
  items: Map<string, MpgItem>;
  currentUser: MpgUser | null;
  sidebarVisible: boolean;
  userSignedIn: boolean;
  dataLoading: boolean;
  itemsLoaded: number;
  matchedItems: Map<string, MpgItem>;
  searchText: string;
}

export default class MpgApp extends React.Component<MpgAppProps, MpgAppState> {
  private appVersion = "My Graph - Version: Alpha (38.001) - 16 July 2020";
  private graph: MpgGraph;
  readonly maxViewWidth = 410;
  private viewWidth: number = this.maxViewWidth;
  private displayWidth: number = 3000;
  private maxDisplayWidth = 10000;
  private viewMargin = 5;
  private startTime: number = new Date().getTime();

  constructor(props: MpgAppProps) {
    super(props);

    this.state = {
      initialLoadInProgress: false,
      dataSavingInprogress: false,
      messageVisible: false,
      messageType: MpgMessageType.Information,
      messageWaitTime: 6000,
      message: "No message",
      appErrorState: false,
      appError: null,
      debugMode: true,
      openItems: new Map<string, MpgViewableItem>(),
      items: new Map<string, MpgItem>(),
      currentUser: null,
      sidebarVisible: false,
      userSignedIn: false,
      dataLoading: true,
      itemsLoaded: 0,
      matchedItems: new Map(),
      searchText: "",
    };
    this.graph = new MpgGraph(this.refreshData, this.state.currentUser);
  }

  toggleDrawer = (open: boolean) => () => {
    this.setState({
      sidebarVisible: open,
    });
  };

  openSerachView = () => {
    const searchItem = new MpgViewableItem(
      "Search",
      MpgItemType.Search,
      "Search"
    );
    const openItems = this.state.openItems;
    openItems.set(searchItem.id, searchItem);
    this.setState({ openItems: openItems });
  };

  renderViewableItemComponent = (item: MpgViewableItem) => {
    switch (item.type) {
      case MpgItemType.Item:
        return (
          <MpgItemView
            item={item as MpgItem}
            viewMargin={this.viewMargin}
            viewWidth={this.viewWidth}
            updateItem={this.updateItem}
            closeView={this.closeView}
          />
        );
      case MpgItemType.Search:
        return (
          <MpgViewableItemView
            currentItem={item}
            viewMargin={this.viewMargin}
            viewWidth={this.viewWidth}
            closeView={this.closeView}
            setMatchedItems={this.setMatchedItems}
            matchedItems={this.state.matchedItems}
            openItem={this.openItem}
          />
        );
      default:
        this.handleError(
          new Error(`MpgApp: invalid ViewableItem type: ${item.type}`)
        );
    }
  };

  refreshAllOpenItems = () => {
    this.state.openItems.forEach((item) => {
      this.refreshOpenItem(item);
    });
  };

  setMatchedItems = (searchText: string) => {
    this.setState({
      matchedItems: this.graph.getMatchedItems(searchText),
      searchText: searchText,
    });
  };

  refreshOpenItem = (item: MpgViewableItem) => {
    const openItems = this.state.openItems;
    if (item.type === MpgItemType.Item) {
      let openItem = this.state.items.get(item.id);
      if (openItem !== undefined) {
        openItems.set(item.id, openItem);
      } else {
        this.state.openItems.delete(item.id);
      }
    }
    this.setState({ openItems: openItems });
  };

  closeView = (item: MpgViewableItem) => {
    const openItems = this.state.openItems;
    openItems.delete(item.id);
    this.setState({ openItems: openItems });
    this.refreshAllOpenItems();
  };

  openItem = (item: MpgItem) => {
    if (!this.state.openItems.has(item.id)) {
      const openItems = this.state.openItems;
      openItems.set(item.id, item);
      this.setState({ openItems: openItems });
    }
  };

  refreshData = async (
    items: Map<string, MpgItem>,
    user: MpgUser,
    initialLoadInProgress: boolean,
    itemsLoaded: number
  ) => {
    let userSignedIn = false;
    if (user !== null) {
      if (user.userSignedOn) {
        userSignedIn = true;
      }
    }
    await this.setState({
      items: items,
      currentUser: user,
      userSignedIn: userSignedIn,
      initialLoadInProgress: initialLoadInProgress,
      itemsLoaded: itemsLoaded,
    });
    if (this.state.dataLoading) {
      if (!this.state.initialLoadInProgress) {
        await this.setState({ dataLoading: false });
        const dataLoadingTime = Math.floor(
          (new Date().getTime() - this.startTime) / 1000
        );
        this.showMessage(
          `Data has been loaded. Elapsed time: ${dataLoadingTime} sec.
           items: ${this.state.itemsLoaded}`,
          MessageType.Information,
          60000
        );
        this.openSerachView()
      } else {
        // initial load is still in progress
        this.showMessage(
          `Loading data ... items loaded: ${this.state.itemsLoaded}`,
          MessageType.Information,
          60000
        );
      }
    } else {
      // do nothing
    }
    this.refreshMatchedItems();
    this.refreshAllOpenItems()
  };

  public updateItem = async (item: MpgItem) => {
    try {
      await this.graph.updateItem(item);
      this.refreshMatchedItems()
      this.refreshAllOpenItems();
    } catch (error) {
      throw error;
    }
  };

  createNewItem = async () => {
    try {
      // this.showMessage("Creating new item");
      const newItemId = await this.graph.createNewItem("New Item");
      if (newItemId !== undefined) {
        const item = this.state.items.get(newItemId);
        if (item !== undefined) {
          this.openItem(item);
        } else {
          throw new Error(`App: createNewItem: item was not found`);
        }
      } else {
        throw new Error(`App: new item could not be created`);
      }
    } catch (error) {
      this.handleError(error);
    }
  };

  refreshMatchedItems = () => {
    this.setMatchedItems(this.state.searchText);
  };

  renderAppInError = () => {
    return (
      <div>
        <h1>Error</h1>
        <p>{this.state.appError?.message};</p>
        <p>{this.state.appError?.stack}</p>
      </div>
    );
  };

  renderNormalApp = () => {
    return (
      <div
        style={{
          width: this.displayWidth,
          height: "100%",
        }}
      >
        <div>
          {this.renderAppBar()}
          <div style={{ paddingTop: 60 }}> </div>
          <div
            style={{
              paddingTop: 5,
              display: "flex",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              textAlign: "center",
              width: this.displayWidth,
              alignItems: "flex-start",
              alignContent: "flex-start",
            }}
          >
            {Array.from(this.state.openItems.values()).map((item) => (
              <div key={item.id}>{this.renderViewableItemComponent(item)}</div>
            ))}
          </div>
          {this.renderMessage()}
          {this.renderDrawer()}
        </div>
      </div>
    );
  };

  static getDerivedStateFromError(error: Error) {
    console.log("getDrivedStateFromError: error:", error);
    return { appErrorState: true };
  }

  componentDidCatch = (error: Error) => {
    console.log("componentDidCatch: error:", error);
    this.setState({ appErrorState: true, appError: error });
  };

  renderAppBar = () => {
    return (
      <div>
        <AppBar position="fixed">
          <Toolbar
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              alignContent: "center",
              backgroundColor: MpgTheme.palette.primary.dark,
            }}
          >
            <div>
              {this.state.initialLoadInProgress ||
              this.state.dataSavingInprogress ? (
                <CircularProgress color="secondary" size={25} value={50} />
              ) : (
                <Icon
                  style={{ margin: "5px" }}
                  onClick={this.toggleDrawer(true)}
                >
                  menu
                </Icon>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1">
                {this.getCurrentUserName() + "  "}
              </Typography>
              <div style={{ width: "10px" }}></div>
              <Typography variant="h5" style={{ fontWeight: "bold" }}>
                My Graph
              </Typography>
              <div style={{ width: "10px" }}></div>
              <Typography variant="body1">
                {"  " + this.state.items.size + " items"}
              </Typography>
            </div>
            {this.state.initialLoadInProgress ||
            this.state.dataSavingInprogress ? (
              <CircularProgress color="secondary" size={25} value={50} />
            ) : (
              <Tooltip title="New item">
                <Icon style={{ margin: "5px" }} onClick={this.createNewItem}>
                  add
                </Icon>
              </Tooltip>
            )}
          </Toolbar>
        </AppBar>
      </div>
    );
  };

  getCurrentUserName = (): string => {
    let userName = "No user";
    if (this.state.currentUser !== null) {
      if (this.state.currentUser.userSignedOn) {
        if (this.state.currentUser.headline !== null) {
          userName = this.state.currentUser.headline;
        }
      }
    }
    return userName;
  };

  handleCloseMessage = () => {
    this.setState({ messageVisible: false });
  };

  renderMessage() {
    const backgroundColor =
      this.state.messageType === MpgMessageType.Information
        ? MpgTheme.palette.primary.dark
        : "red";
    return (
      <div style={{ display: "flex" }}>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={this.state.messageVisible}
          autoHideDuration={this.state.messageWaitTime}
          onClose={this.handleCloseMessage}
          ContentProps={{
            "aria-describedby": "message-id",
          }}
        >
          <SnackbarContent
            style={{
              backgroundColor: backgroundColor,
              color: MpgTheme.palette.primary.contrastText,
            }}
            message={<span id="message-id">{this.state.message}</span>}
            action={[
              <Button
                key="undo"
                color="inherit"
                size="small"
                onClick={this.handleCloseMessage}
              >
                Close
              </Button>,
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={this.handleCloseMessage}
              ></IconButton>,
            ]}
          />
        </Snackbar>
      </div>
    );
  }

  renderMenuItems = () => {
    return (
      <div>
        <Divider />
        <List style={{ width: "300px" }}>
          <Divider />
          <ListItem button onClick={this.openSerachView}>
            <ListItemText primary="Search" />
          </ListItem>
          <Divider />
          <ListItem button onClick={this.signinUser}>
            <ListItemText primary="Signin" />
          </ListItem>
          <ListItem button onClick={this.functionNotImplementedYet}>
            <ListItemText primary="Sign out" />
          </ListItem>
          <Divider />
        </List>
        <Divider />
      </div>
    );
  };

  functionNotImplementedYet = () => {
    this.showMessage(`Sorry, function has not been implemented yet`);
  };

  signinUser = async () => {
    this.startTime = new Date().getTime();
    this.graph.signinUser();
  };

  renderDrawer = () => {
    return (
      <SwipeableDrawer
        open={this.state.sidebarVisible}
        onClose={this.toggleDrawer(false)}
        onOpen={this.toggleDrawer(true)}
        color="#DCDCDC"
      >
        <div
          tabIndex={0}
          role="button"
          onClick={this.toggleDrawer(false)}
          onKeyDown={this.toggleDrawer(false)}
        >
          {this.renderMenuItems()}
        </div>
      </SwipeableDrawer>
    );
  };

  componentDidMount = async () => {
    try {
      this.updateSize();
      this.showMessage(
        "App has started. Version: " + this.appVersion,
        MpgMessageType.Information,
        12000
      );
      await this.graph.initialise();
      if (this.state.dataLoading) {
        this.showMessage("Loading data ... please wait");
        this.startTime = new Date().getTime();
      } else {
        this.openSerachView();
      }
    } catch (error) {
      // this.setState({appErrorState: true, appError: error})
      // throw error
      this.handleError(error);
    }
  };

  handleError = (error: Error) => {
    if (this.state.debugMode) {
      throw error;
    } else {
      // this.setState({appErrorState: true, appError: error})
      this.showMessage(error.message, MpgMessageType.Error, 12000);
    }
    // show error details log it, etc
  };

  render = () => {
    return (
      <div>
        {this.state.appErrorState && this.state.debugMode
          ? this.renderAppInError()
          : this.renderNormalApp()}
      </div>
    );
  };

  private showMessage = (
    message: string,
    messageType: MpgMessageType = MpgMessageType.Information,
    messageWaitTime: number = 7000
  ) => {
    if (messageType === MpgMessageType.Error) {
      messageWaitTime = 900000;
    }
    this.setState({
      messageVisible: true,
      message: message,
      messageWaitTime: messageWaitTime,
      messageType: messageType,
    });
  };

  updateSize = () => {
    if (window.innerWidth < this.maxViewWidth) {
      this.viewWidth = window.innerWidth;
      this.viewMargin = 0;
      this.displayWidth = window.innerWidth;
    } else {
      this.viewWidth = this.maxViewWidth;
      this.displayWidth = this.maxDisplayWidth;
    }
  };
}
