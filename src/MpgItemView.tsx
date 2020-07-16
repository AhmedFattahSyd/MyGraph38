import React from "react";
import MpgItem from "./MpgItem";
import {
  ThemeProvider,
  Card,
  Typography,
  Tooltip,
  Icon,
  CircularProgress,
  Button,
  TextField,
} from "@material-ui/core";
import MpgTheme from "./MpgTheme";

interface ItemViewProps {
  item: MpgItem;
  viewWidth: number;
  viewMargin: number;
  updateItem: Function;
  closeView: Function
}
interface ItemViewState {
  currentItem: MpgItem;
  itemDataChanged: boolean;
  dataSavingInProgress: boolean;
  headlineText: string;
}

export default class MpgItemView extends React.Component<
  ItemViewProps,
  ItemViewState
> {
  private renderHeaderFun: Function;

  constructor(props: ItemViewProps) {
    super(props);
    this.state = {
      currentItem: props.item,
      itemDataChanged: false,
      dataSavingInProgress: false,
      headlineText: props.item.headline,
    };
    this.renderHeaderFun = this.renderItemHeader;
  }

  renderButtons = () => {
    return this.state.itemDataChanged
      ? this.renderSaveAndClose()
      : this.renderClose();
  };

  handleClose = () => {
    if (!this.state.itemDataChanged) {
      this.props.closeView(this.state.currentItem);
    } else {
      // do nothing
      // cannot close item if it has changed
      // use delete or save it
      // better we should disable close
    }
  }

  handleSaveAndClose = async () => {
    await this.updateItem();
    this.props.closeView(this.state.currentItem);
  };

  renderClose = () => {
    return (
      <div>
        <Button
            onClick={() => this.handleClose()}
          style={{
            margin: 5,
            color: MpgTheme.palette.primary.contrastText,
            backgroundColor: MpgTheme.palette.primary.main,
          }}
          size="small"
          // color="secondary"
          disabled={this.state.itemDataChanged}
        >
          Close
        </Button>
        <Button
          variant="contained"
          //   onClick={() => this.handleItemDelete()}
          style={{
            margin: 5,
            color: MpgTheme.palette.primary.contrastText,
            backgroundColor: MpgTheme.palette.primary.main,
          }}
          size="small"
          // color="secondary"
        >
          Delete
        </Button>
      </div>
    );
  };

  renderSaveAndClose = () => {
    return (
      <div>
        <Button
          //   onClick={() => this.handleSave()}
          style={{
            margin: 5,
            color: MpgTheme.palette.primary.contrastText,
            backgroundColor: MpgTheme.palette.primary.main,
          }}
          size="small"
          // color="secondary"
        >
          Save
        </Button>
        <Button
            onClick={() => this.handleSaveAndClose()}
          style={{
            margin: 5,
            color: MpgTheme.palette.primary.contrastText,
            backgroundColor: MpgTheme.palette.primary.main,
          }}
          size="small"
          // color="secondary"
        >
          Save and close
        </Button>
        <Button
          variant="contained"
          //   onClick={() => this.handleItemDelete()}
          style={{
            margin: 5,
            color: MpgTheme.palette.primary.contrastText,
            backgroundColor: MpgTheme.palette.primary.main,
          }}
          size="small"
          // color="secondary"
        >
          Delete
        </Button>
      </div>
    );
  };

  renderRightIcon = () => {
    let saveIconColor = this.state.itemDataChanged
      ? MpgTheme.palette.secondary.light
      : MpgTheme.palette.primary.contrastText;
    return (
      <div>
        {!this.state.dataSavingInProgress ? (
          <Tooltip title={"Save"}>
            <Icon
              //   onClick={() => this.props.updateItem}
              style={{ fontSize: "18px", color: saveIconColor }}
            >
              save
            </Icon>
          </Tooltip>
        ) : (
          <CircularProgress color="secondary" size={25} value={50} />
        )}
      </div>
    );
  };

  renderBody = () => {
    return (
      <Card
        elevation={1}
        style={{
          margin: 5,
          backgroundColor: MpgTheme.palette.primary.main,
        }}
      >
        <Card
          elevation={1}
          style={{ textAlign: "left", margin: 5, padding: 3 }}
        >
          <div style={{ display: "flex" }}>
            {/* {this.renderDate(this.state.currentItem)} */}
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Headline"
              fullWidth
              multiline
              value={this.state.headlineText}
              // onKeyPress={this.handleKeyPressed}
              onChange={(event) => this.handleHeadlineChanged(event)}
              onBlur={this.updateItem}
              onFocus={(event) => event.target.select()}
            />
          </div>
        </Card>
      </Card>
    );
  };

  static getDerivedStateFromProps = (
    newProps: ItemViewProps,
    state: ItemViewState
  ) => {
    state = {
      ...state,
      currentItem: newProps.item,
    };
    return state;
  };

  updateItem = async () => {
    try {
      if (this.state.itemDataChanged) {
        const item = this.state.currentItem;
        item.headline = this.state.headlineText;
        await this.props.updateItem(item);
        this.setState({
          currentItem: item,
          itemDataChanged: false,
        });
      } else {
        // do nothing. data has not changed
      }
    } catch (error) {
      throw error;
    }
  };

  handleHeadlineChanged = async (event: React.ChangeEvent) => {
    this.setState({
      headlineText: (event.target as HTMLInputElement).value,
      itemDataChanged: true,
    });
  };

  render = () => {
    // const closeButtonColor = this.state.itemDataChanged
    // ? MpgTheme.palette.background
    // : MpgTheme.palette.primary.main;
    return (
      <ThemeProvider theme={MpgTheme}>
        <div>
          <Card
            elevation={1}
            style={{
              maxWidth: this.props.viewWidth,
              minWidth: this.props.viewWidth,
              margin: this.props.viewMargin,
              marginTop: 5,
              backgroundColor: MpgTheme.palette.primary.dark,
            }}
          >
            {this.renderHeaderFun()}
            {this.renderBody()}
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                margin: 5,
              }}
            ></div>
            {this.renderButtons()}
          </Card>
        </div>
      </ThemeProvider>
    );
  };

  renderItemHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignContent: "center",
          alignItems: "center",
          margin: 5,
        }}
      >
        {this.renderLeftIcon()}
        <Typography
          variant="h6"
          style={{
            fontWeight: "bold",
            color: MpgTheme.palette.primary.contrastText,
          }}
        >
          {this.state.currentItem.getShortHeadline()}
        </Typography>
        {this.renderRightIcon()}
      </div>
    );
  };

  renderLeftIcon = () => {
    let saveIconColor = this.state.itemDataChanged
      ? MpgTheme.palette.secondary.light
      : MpgTheme.palette.primary.contrastText;
    return (
      <div>
        {!this.state.dataSavingInProgress ? (
          <Tooltip title={"Close"}>
            <Icon
              //   onClick={() => this.handleClose()}
              style={{ fontSize: "18px", color: saveIconColor }}
            >
              close
            </Icon>
          </Tooltip>
        ) : (
          <CircularProgress color="secondary" size={25} value={50} />
        )}
      </div>
    );
  };
}
