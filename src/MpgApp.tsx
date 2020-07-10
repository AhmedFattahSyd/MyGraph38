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
} from "@material-ui/core";
import MpgTheme from "./MpgTheme";
import MpgGraph, { MessageType as MpgMessageType } from "./MpgGraph";
import MpgViewableItem from "./MpgViewableItem";
import MpgItemView from "./MpgItemView";
import MpgItem from "./MpgItem";
import { MpgItemType } from "./MpgItemType";
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
}

export default class MpgApp extends React.Component<MpgAppProps, MpgAppState> {
  private appVersion = "My Graph - Version: Alpha (38.001) - 25 June 2020";
  private graph: MpgGraph;
  readonly maxViewWidth = 410;
  private viewWidth: number = this.maxViewWidth;
  private displayWidth: number = 3000;
  private maxDisplayWidth = 10000;
  private viewMargin = 5;

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
    };
    this.graph = new MpgGraph(this.refreshData);
  }

  renderViewableItemComponent = (item: MpgViewableItem) => {
    switch (item.type) {
      case MpgItemType.Item:
        return (
          <MpgItemView
            item={item as MpgItem}
            viewMargin={this.viewMargin}
            viewWidth={this.viewWidth}
          />
        );
      default:
        this.handleError(
          new Error(`MpgApp: invalid ViewableItem type: ${item.type}`)
        );
    }
  };

  openItem = (item: MpgItem) => {
    if (!this.state.openItems.has(item.id)) {
      const openItems = this.state.openItems;
      openItems.set(item.id, item);
      this.setState({ openItems: openItems });
    }
  };

  refreshData = async (items: Map<string, MpgItem>) => {
    await this.setState({ items: items });
  };

  createNewItem = async () => {
    try {
      this.showMessage("Creating new item");
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
                  // onClick={this.toggleDrawer(true)}
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
    // if (this.state.currentUser !== null) {
    //   if (this.state.currentUser.userSignedOn) {
    //     if (this.state.currentUser.headline !== null) {
    //       userName = this.state.currentUser.headline;
    //     }
    //   }
    // }
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

  componentDidMount = async () => {
    try {
      this.updateSize();
      await this.graph.initialise();
      // if (this.state.dataLoading) {
      //   this.showMessage("Loading data ... please wait");
      //   this.startTime = new Date().getTime();
      // } else {
      //   this.openSerachView();
      // }
      this.showMessage(
        "App has started. Version: " + this.appVersion,
        MpgMessageType.Information,
        12000
      );
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
