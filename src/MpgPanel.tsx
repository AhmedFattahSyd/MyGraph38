import React from "react";
import { Card, Tooltip, Icon, CardActionArea } from "@material-ui/core";
import MpgTheme from "./MpgTheme";

export interface PanelInterface {
  index: number;
  renderLabelFun: Function;
  renderDetailsFun: Function;
  initialStateOpen: boolean;
  leftSideFunction?: Function;
  leftSideFunctionIcon?: string;
  leftSideFunctionToolTip?: string;
  leftSideFunctionEnabled?: boolean;
}

interface IMpgPanelProps {
  index: number;
  renderLabelFun: Function;
  renderDetailFun: Function;
  initialStateOpen: boolean;
  leftSideFunction?: Function;
  leftSideFunctionIcon?: string;
  leftSideFunctionToolTip?: string;
  leftSideFunctionEnabled?: boolean;
}
interface IMpgPanelState {
  panelExpanded: boolean;
  //   menuOpen: boolean;
  //   menuAnchorEl: null | HTMLElement;
  //   leftSideFunction: Function;
  leftSideFunctionIcon: string;
  leftSideFunctionToolTip: string;
  leftSideFunctionEnabled: boolean;
}

export default class MpgPanel extends React.Component<
  IMpgPanelProps,
  IMpgPanelState
> {
  constructor(props: IMpgPanelProps) {
    super(props);
    // let leftSideFunction = this.doNothing;
    // if (props.leftSideFunction !== undefined) {
    //   leftSideFunction = props.leftSideFunction;
    // }
    let leftSideFunctionIcon = "";
    if (props.leftSideFunctionIcon !== undefined) {
      leftSideFunctionIcon = props.leftSideFunctionIcon;
    }
    let leftSideFunctionToolTip = "";
    if (props.leftSideFunctionToolTip !== undefined) {
      leftSideFunctionToolTip = props.leftSideFunctionToolTip;
    }
    let leftSideFunctionEnabled = false;
    if (props.leftSideFunctionEnabled !== undefined) {
      leftSideFunctionEnabled = props.leftSideFunctionEnabled;
    }
    this.state = {
      panelExpanded: props.initialStateOpen,
      leftSideFunctionEnabled: leftSideFunctionEnabled,
      leftSideFunctionIcon: leftSideFunctionIcon,
      leftSideFunctionToolTip: leftSideFunctionToolTip,
      //   menuOpen: false,
      //   menuAnchorEl: null,
    };
  }

  //   doNothing = (): Function => {
  //     // a placeholder for no funtion on left side icon
  //     return this.noOp
  //   };

  //   noOP = ()=>{
  //       // do nothing
  //   }

  render = () => {
    return (
      <div>
        <Card
          elevation={1}
          style={{
            margin: 5,
            backgroundColor: MpgTheme.palette.primary.light,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {this.renderLeftFunctionIcon()}
            <CardActionArea onClick={this.handleToggleExpansionState}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                {this.props.renderLabelFun(this.props.index)}
                {/* <Typography
                  variant="body1"
                  style={{
                    fontWeight: "bold",
                    color: MpgTheme.palette.primary.dark,
                  }}
                >
                  {this.props.renderLabelFun(this.props.index)}
                </Typography> */}
              </div>
            </CardActionArea>
            {this.renderExpansionIcon()}
          </div>
          {this.state.panelExpanded ? (
            this.props.renderDetailFun(this.props.index)
          ) : (
            <div></div>
          )}
        </Card>
      </div>
    );
  };

  renderExpansionIcon = () => {
    return (
      <div>
        {this.state.panelExpanded ? (
          <Tooltip title="Contract">
            <Icon
              style={{ fontSize: "25px", color: MpgTheme.palette.primary.dark }}
              onClick={this.handleToggleExpansionState}
            >
              arrow_drop_up
            </Icon>
          </Tooltip>
        ) : (
          <Tooltip title="Expand">
            <Icon
              style={{ fontSize: "25px", color: MpgTheme.palette.primary.dark }}
              onClick={this.handleToggleExpansionState}
            >
              arrow_drop_down
            </Icon>
          </Tooltip>
        )}
      </div>
    );
  };

  renderLeftFunctionIcon = () => {
    return (
      <div>
        {this.props.leftSideFunctionEnabled ? (
          <Tooltip title={this.state.leftSideFunctionToolTip}>
            <Icon
              style={{ fontSize: "18px", color: MpgTheme.palette.primary.dark }}
              onClick={() => this.handleLeftFunctionIconClick()}
            >
              {this.props.leftSideFunctionIcon}
            </Icon>
          </Tooltip>
        ) : (
          <div></div>
        )}
      </div>
    );
  };

  handleLeftFunctionIconClick = () => {
    if (this.state.leftSideFunctionEnabled) {
      if (this.props.leftSideFunction !== undefined) {
        this.props.leftSideFunction();
      }
    }
  };

//   renderLeftMenuIcon = () => {
//     return (
//       <div>
//         <Tooltip title="Menu">
//           <Icon
//             style={{ fontSize: "14px", color: MpgTheme.palette.primary.dark }}
//             onClick={(event) => this.handleOpenMenu(event)}
//           >
//             menu
//           </Icon>
//         </Tooltip>
//         {this.renderMenu()}
//       </div>
//     );
//   };

//   renderMenu = () => {
//     return (
//       <div>
//         <Menu
//           id="simple-menu"
//           keepMounted
//           open={this.state.menuOpen}
//           onClose={this.handleCloseMenu}
//           anchorEl={this.state.menuAnchorEl}
//         >
//           {/* <MenuItem onClick={this.handleCloseMenu}>Profile</MenuItem>
//           <MenuItem onClick={this.handleCloseMenu}>My account</MenuItem>
//           <MenuItem onClick={this.handleCloseMenu}>Logout</MenuItem> */}
//         </Menu>
//       </div>
//     );
//   };

//   handleCloseMenu = () => {
//     this.setState({ menuOpen: false });
//   };

//   handleOpenMenu = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
//     this.setState({ menuOpen: true, menuAnchorEl: event.currentTarget });
//   };

  handleToggleExpansionState = () => {
    this.setState({ panelExpanded: !this.state.panelExpanded });
  };
}
