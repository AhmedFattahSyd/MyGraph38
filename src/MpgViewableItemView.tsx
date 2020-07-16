import MpgViewableItem from "./MpgViewableItem";
import React from "react";
import {
  Typography,
  Card,
  Button,
  ThemeProvider,
  TextField,
  Tooltip,
  Icon,
} from "@material-ui/core";
import MpgTheme from "./MpgTheme";
import { MpgItemType } from "./MpgItemType";
import MpgPanel, { PanelInterface } from "./MpgPanel";
import MpgItem from "./MpgItem";
import MpgItemListCompenent from "./MpgItemListComponent";

interface ViewableItemViewProps {
  currentItem: MpgViewableItem;
  viewWidth: number;
  viewMargin: number;
  closeView: Function;
  setMatchedItems: Function;
  matchedItems: Map<string, MpgItem>;
  openItem: Function
}
interface ViewableItemViewState {
  searchText: string;
  matchedItems: Map<string, MpgItem>;
}

export default class MpgViewableItemView extends React.Component<
  ViewableItemViewProps,
  ViewableItemViewState
> {
  private renderHeaderFunction: Function;
  private panelList: PanelInterface[] = [];
  constructor(props: ViewableItemViewProps) {
    super(props);
    this.state = {
      searchText: "",
      matchedItems: props.matchedItems,
    };
    this.renderHeaderFunction = this.renderSearchHeader;
    this.initViewParameters();
  }

  static getDerivedStateFromProps = (
    newProps: ViewableItemViewProps,
    state: ViewableItemViewState
  ) => {
    state = {
      ...state,
      matchedItems: newProps.matchedItems,
    };
    return state;
  };

  renderSearchHeader = () => {
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
            textAlign: "center",
          }}
        >
          Search graph
        </Typography>
        {this.renderRightIcon()}
      </div>
    );
  };

  renderRightIcon = () => {
    return <div style={{ width: 5 }}></div>;
  };

  renderLeftIcon = () => {
    return (
      <div>
        <Tooltip title={"Close"}>
          <Icon
            onClick={() => this.handleClose()}
            style={{
              fontSize: "18px",
              color: MpgTheme.palette.primary.contrastText,
            }}
          >
            close
          </Icon>
        </Tooltip>
      </div>
    );
  };

  private initViewParameters = () => {
    switch (this.props.currentItem.type) {
      case MpgItemType.Search:
        this.initSearchParameters();
        break;
      default:
        throw new Error(
          `ViewableItemView: invalid current item type:${this.props.currentItem.type}`
        );
    }
  };

  renderItemsPanelLabel = () => {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Typography
          variant="body1"
          style={{
            fontWeight: "bold",
            color: MpgTheme.palette.primary.dark,
          }}
        >
          {"Items: (" + this.state.matchedItems.size + ")"}
        </Typography>
      </div>
    );
  };

  private renderMatchedItems = () => {
    return (
      <div>
        {this.state.matchedItems.size > 0 ? (
          <div>
            <Card
              style={{
                backgroundColor: MpgTheme.palette.primary.light,
                margin: 5,
              }}
            >
              <MpgItemListCompenent
                items={this.state.matchedItems}
                openItem={this.props.openItem}
                // deleteItem={this.props.deleteItem}
                // refreshItem={this.refreshItem}
                // updateItem={this.props.updateItem}
                // removeFromListEnabled={false}
                // removeFromListToolTip={""}
                // removeFromListFun={this.handleRemoveFromList}
                // showArchived={true}
                // removeTagFromItem={this.props.removeTagFromItem}
                // showParked={true}
                // showActive={true}
                // setDataSavingInProgress={this.props.setDataSavingInProgress}
              />
            </Card>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    );
  };

  private initSearchParameters = () => {
    this.panelList.push({
      index: 0,
      renderLabelFun: this.renderItemsPanelLabel,
      renderDetailsFun: this.renderMatchedItems,
      initialStateOpen: false,
      //   leftSideFunction: this.handleRemoveFromList,
      //   leftSideFunctionEnabled: true,
      //   leftSideFunctionIcon: "",
      //   leftSideFunctionToolTip: "",
    });
    // this.panelList.push({
    //   index: 1,
    //   renderLabelFun: this.renderTagsPanelLabel,
    //   renderDetailsFun: this.renderMatchedTags,
    //   initialStateOpen: false,
    //   leftSideFunction: this.handleRemoveFromList,
    //   leftSideFunctionEnabled: true,
    //   leftSideFunctionIcon: "",
    //   leftSideFunctionToolTip: "",
    // });
    // this.panelList.push({
    //   index: 2,
    //   renderLabelFun: this.renderEntriesPanelLabel,
    //   renderDetailsFun: this.renderMatchedEntries,
    //   initialStateOpen: false,
    //   leftSideFunction: this.handleRemoveFromList,
    //   leftSideFunctionEnabled: true,
    //   leftSideFunctionIcon: "",
    //   leftSideFunctionToolTip: "",
    // });
    this.renderHeaderFunction = this.renderSearchHeader;
  };

  render = () => {
    return (
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
          {this.renderHeaderFunction()}
          {this.renderItemBodyAbovePanels()}
          {/* {this.props.currentItem.type === MpgItemType.Search
                ? this.renderSearchParamsDetails()
                : this.renderTimelineDetails()} */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              margin: 5,
            }}
          >
            <Button
              onClick={() => this.handleClose()}
              style={{
                margin: 5,
                color: MpgTheme.palette.primary.contrastText,
                backgroundColor: MpgTheme.palette.primary.main,
              }}
              size="small"
            >
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  renderItemBodyAbovePanels = () => {
    switch (this.props.currentItem.type) {
      case MpgItemType.Search:
        return this.renderSearchParamsDetails();
      default:
        return <div></div>;
    }
  };

  private renderSearchParamsDetails = () => {
    return (
      <ThemeProvider theme={MpgTheme}>
        <Card
          elevation={1}
          style={{
            textAlign: "left",
            margin: 5,
            paddingRight: 2,
            paddingLeft: 2,
            paddingTop: -150,
            paddingBottom: 0,
            //   width: "100%"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              margin: 5,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <TextField
                id="seachText"
                autoFocus
                // onFocus={event => event.target.select()}
                label="Search text"
                value={this.state.searchText}
                margin="normal"
                style={{ width: "80%", fontSize: 12 }}
                onChange={this.handleSearchTextChange}
                // onKeyPress={this.handleKeyPressed}
                // onBlur={event=>this.setAllMatchedItems()}
              />
              <Button
                onClick={() => this.setAllMatchedItems()}
                style={{
                  margin: 0,
                  color: MpgTheme.palette.primary.contrastText,
                  backgroundColor: MpgTheme.palette.primary.main,
                  height: 20,
                  width: 30,
                  fontSize: 9,
                }}
                size="small"
              >
                Search
              </Button>
            </div>
          </div>
          {this.renderPanels()}
        </Card>
      </ThemeProvider>
    );
  };

  private renderPanels = () => {
    return (
      <div>
        <Card
          elevation={1}
          style={{
            margin: 5,
            backgroundColor: MpgTheme.palette.primary.main,
          }}
        >
          {this.panelList.map((panel) => {
            return (
              <div key={panel.index}>
                <MpgPanel
                  index={panel.index}
                  renderLabelFun={panel.renderLabelFun}
                  renderDetailFun={panel.renderDetailsFun}
                  initialStateOpen={panel.initialStateOpen}
                  leftSideFunction={panel.leftSideFunction}
                  leftSideFunctionIcon={panel.leftSideFunctionIcon}
                  leftSideFunctionToolTip={panel.leftSideFunctionToolTip}
                  leftSideFunctionEnabled={panel.leftSideFunctionEnabled}
                />
              </div>
            );
          })}
        </Card>
      </div>
    );
  };

  setAllMatchedItems = () => {
    this.props.setMatchedItems(this.state.searchText);
  };

  handleSearchTextChange = async (event: React.ChangeEvent) => {
    const searchText = (event.target as HTMLInputElement).value;
    this.setState({
      searchText: searchText,
    });
  };

  handleClose = () => {
    this.props.closeView(this.props.currentItem);
  };
}
