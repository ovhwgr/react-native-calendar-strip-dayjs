/**
 * Created by bogdanbegovic on 8/20/16.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { polyfill } from "react-lifecycles-compat";

import { Text, View, LayoutAnimation, TouchableOpacity } from "react-native";
import styles from "./Calendar.style.js";

class CalendarDay extends Component {
  static propTypes = {
    date: PropTypes.object.isRequired,
    onDateSelected: PropTypes.func.isRequired,
    selected: PropTypes.bool.isRequired,
    enabled: PropTypes.bool.isRequired,

    marking: PropTypes.any,
    markedDates: PropTypes.array,

    showDayName: PropTypes.bool,
    showDayNumber: PropTypes.bool,

    calendarColor: PropTypes.string,

    dateNameStyle: PropTypes.any,
    dateNumberStyle: PropTypes.any,
    weekendDateNameStyle: PropTypes.any,
    weekendDateNumberStyle: PropTypes.any,
    highlightDateNameStyle: PropTypes.any,
    highlightDateNumberStyle: PropTypes.any,
    disabledDateNameStyle: PropTypes.any,
    disabledDateNumberStyle: PropTypes.any,
    markedDatesStyle: PropTypes.object,
    disabledDateOpacity: PropTypes.number,
    styleWeekend: PropTypes.bool,
    customStyle: PropTypes.object,

    daySelectionAnimation: PropTypes.object,
    allowDayTextScaling: PropTypes.bool,
    size: PropTypes.number
  };

  // Reference: https://medium.com/@Jpoliachik/react-native-s-layoutanimation-is-awesome-4a4d317afd3e
  static defaultProps = {
    daySelectionAnimation: {
      type: "", // animations disabled by default
      duration: 300,
      borderWidth: 1,
      borderHighlightColor: "black",
      highlightColor: "yellow",
      animType: LayoutAnimation.Types.easeInEaseOut,
      animUpdateType: LayoutAnimation.Types.easeInEaseOut,
      animProperty: LayoutAnimation.Properties.opacity,
      animSpringDamping: undefined // Only applicable for LayoutAnimation.Types.spring,
    },
    styleWeekend: true,
    showDayName: true,
    showDayNumber: true
  };

  constructor(props) {
    super(props);

    this.state = {
      selected: props.selected,
      ...this.calcSizes(props)
    };
  }

  componentDidUpdate(prevProps, prevState) {
    let newState = {};
    let doStateUpdate = false;

    if (this.props.selected !== prevProps.selected) {
      if (this.props.daySelectionAnimation.type !== "") {
        let configurableAnimation = {
          duration: this.props.daySelectionAnimation.duration || 300,
          create: {
            type:
              this.props.daySelectionAnimation.animType ||
              LayoutAnimation.Types.easeInEaseOut,
            property:
              this.props.daySelectionAnimation.animProperty ||
              LayoutAnimation.Properties.opacity
          },
          update: {
            type:
              this.props.daySelectionAnimation.animUpdateType ||
              LayoutAnimation.Types.easeInEaseOut,
            springDamping: this.props.daySelectionAnimation.animSpringDamping
          },
          delete: {
            type:
              this.props.daySelectionAnimation.animType ||
              LayoutAnimation.Types.easeInEaseOut,
            property:
              this.props.daySelectionAnimation.animProperty ||
              LayoutAnimation.Properties.opacity
          }
        };
        LayoutAnimation.configureNext(configurableAnimation);
      }
      newState.selected = this.props.selected;
      doStateUpdate = true;
    }

    if (prevProps.size !== this.props.size) {
      newState = { ...newState, ...this.calcSizes(this.props) };
      doStateUpdate = true;
    }

    if (doStateUpdate) {
      this.setState(newState);
    }
  }

  calcSizes(props) {
    return {
      containerSize: Math.round(props.size),
      containerPadding: Math.round(props.size / 5),
      containerBorderRadius: Math.round(props.size / 2),
      dateNameFontSize: Math.round(props.size / 5),
      dateNumberFontSize: Math.round(props.size / 2.9)
    };
  }

  createDots(dots) {
    const baseDotStyle = [styles.dot, styles.visibleDot];
    const markedDatesStyle = this.props.markedDatesStyle || {};
    const marking = this.props.marking || {};

    return dots.map((dot, index) => {
      return (
        <View
          key={dot.key ? dot.key : index}
          style={[
            baseDotStyle,
            {
              backgroundColor:
                marking.selected && dot.selectedDotColor
                  ? dot.selectedDotColor
                  : dot.color
            },
            markedDatesStyle
          ]}
        />
      );
    });
  }

  renderDots() {
    if (!this.props.markedDates || this.props.markedDates.length === 0) {
      return;
    }
    const marking = this.props.marking || {};
    const topDots = marking.dots && marking.dots.filter(d => d.color && d.top);
    const bottomDots = marking.dots && marking.dots.filter(d => d.color && !d.top);
    let validTopDots = <View />; // default empty view for no dots case
    let validBottomDots = <View />; // default empty view for no dots case

    if (topDots && topDots.length) {
      validTopDots = this.createDots(topDots);
    }

    if (bottomDots && bottomDots.length) {
      validBottomDots = this.createDots(bottomDots);
    }

    return (
      <>
        <View style={[styles.dotsContainer, styles.topDotsContainer]}>{validTopDots}</View>
        <View style={styles.dotsContainer}>{validBottomDots}</View>
      </>
    );
  }

  render() {
    // Defaults for disabled state
    let dateNameStyle = [
      styles.dateName,
      this.props.enabled
        ? this.props.dateNameStyle
        : this.props.disabledDateNameStyle
    ];
    let dateNumberStyle = [
      styles.dateNumber,
      this.props.enabled
        ? this.props.dateNumberStyle
        : this.props.disabledDateNumberStyle
    ];
    let dateViewStyle = this.props.enabled
      ? [{ backgroundColor: "transparent" }]
      : [{ opacity: this.props.disabledDateOpacity }];

    let customStyle = this.props.customStyle;
    if (customStyle) {
      dateNameStyle.push(customStyle.dateNameStyle);
      dateNumberStyle.push(customStyle.dateNumberStyle);
      dateViewStyle.push(customStyle.dateContainerStyle);
    }
    if (this.props.enabled && this.state.selected) {
      // Enabled state
      //The user can disable animation, so that is why I use selection type
      //If it is background, the user have to input colors for animation
      //If it is border, the user has to input color for border animation
      switch (this.props.daySelectionAnimation.type) {
        case "background":
          dateViewStyle.push({
            backgroundColor: this.props.daySelectionAnimation.highlightColor
          });
          break;
        case "border":
          dateViewStyle.push({
            borderColor: this.props.daySelectionAnimation.borderHighlightColor,
            borderWidth: this.props.daySelectionAnimation.borderWidth
          });
          break;
        default:
          // No animation styling by default
          break;
      }

      dateNameStyle = [styles.dateName, this.props.dateNameStyle];
      dateNumberStyle = [styles.dateNumber, this.props.dateNumberStyle];
      if (
        this.props.styleWeekend &&
        (this.props.date.day() === 6 || this.props.date.day() === 0)
      ) {
        dateNameStyle = [
          styles.weekendDateName,
          this.props.weekendDateNameStyle
        ];
        dateNumberStyle = [
          styles.weekendDateNumber,
          this.props.weekendDateNumberStyle
        ];
      }
      if (this.state.selected) {
        dateNameStyle = [styles.dateName, this.props.highlightDateNameStyle];
        dateNumberStyle = [
          styles.dateNumber,
          this.props.highlightDateNumberStyle
        ];
      }
    }

    let responsiveDateContainerStyle = {
      width: this.state.containerSize,
      height: this.state.containerSize,
      borderRadius: this.state.containerBorderRadius,
      padding: this.state.containerPadding
    };

    return (
      <TouchableOpacity
        onPress={this.props.onDateSelected.bind(this, this.props.date)}
      >
        <View
          key={this.props.date}
          style={[
            styles.dateContainer,
            responsiveDateContainerStyle,
            dateViewStyle
          ]}
        >
          {this.props.showDayName && (
            <Text
              style={[dateNameStyle, { fontSize: this.state.dateNameFontSize }]}
              allowFontScaling={this.props.allowDayTextScaling}
            >
              {this.props.date.format("ddd").toUpperCase()}
            </Text>
          )}
          {this.props.showDayNumber && (
            <View>
              <Text
                style={[
                  { fontSize: this.state.dateNumberFontSize },
                  dateNumberStyle
                ]}
                allowFontScaling={this.props.allowDayTextScaling}
              >
                {this.props.date.date()}
              </Text>
              {this.renderDots()}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
}

polyfill(CalendarDay);

export default CalendarDay;
