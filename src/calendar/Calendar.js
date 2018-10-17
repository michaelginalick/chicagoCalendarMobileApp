// @flow

import React, {PureComponent} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import moment from 'moment';
import Dates from './Dates';
import type Moment from 'moment';


type Props = {
  currentDate?: string | moment,
  onSelectDate: (date: Moment) =>  any,
  showDaysAfterCurrent?: number,
  showDaysBeforeCurrent?: number,
};


type State = {
  
  allDatesHaveRendered: boolean,
  currentDateIndex: ?number,
  visibleMonths: ?Array<string>,
  visibleYears: ?Array<string>,
  dates: Array<Moment>,
  dayWidths: ?{| [index: number]: number |},
  scrollPositionX: number,
}

const { width: screenWidth } = Dimensions.get('window');

const formatMonth = (date: Moment): string => date.format('MMMM');

const formatYear = (date: Moment): string => date.format('YYYY');

export default class Calendar extends PureComponent {

  props: Props;

  state: State;

  static defaultProps = {
    showDaysBeforeCurrent: 5,
    showDaysAfterCurrent: 5,
  };

  _scrollView;

  constructor(props: Props) {
    super(props);
    this.state = {
      allDatesHaveRendered: false,
      currentDateIndex: props.showDaysBeforeCurrent,
      dates: this.getDates(),
      dayWidths: undefined,
      scrollPositionX: 0,
      visibleMonths: undefined,
      visibleYears: undefined,
    };
  }

  getDates = (): Array<Moment> => {
    const {
      currentDate,
      showDaysBeforeCurrent,
      showDaysAfterCurrent,
    } = this.props;


  onSelectDay = (index: number) => {
    const { dates } = this.state;
    const { onSelectDate } = this.props;
    this.setState({ currentDateIndex: index });
    onSelectDate(dates[index]);
  };


  onRenderDay = (index: number, width: number) => {
    const { dayWidths } = this.state;
    const {
      showDaysBeforeCurrent,
      showDaysAfterCurrent,
    } = this.props;

    // Check whether all date have been rendered already
    const allDatesHaveRendered = dayWidths
      && Object.keys(dayWidths).length >= showDaysBeforeCurrent + showDaysAfterCurrent;

    this.setState(prevState => ({
      allDatesHaveRendered,
      dayWidths: {
        // keep all existing widths added previously
        ...prevState.dayWidths,
        // keep the index for calculating scrolling position for each day
        [index]: width,
      },
    }));
  };

    const startDay = moment(currentDate || undefined).subtract(showDaysBeforeCurrent + 1, 'days');
    const totalDaysCount = showDaysBeforeCurrent + showDaysAfterCurrent + 1;

    return [...Array(totalDaysCount)]
      .map(_ => startDay.add(1, 'day').clone());
  };

  getVisibleDates = (): ?Array<Moment> => {

    const {
      dates,
      dayWidths,
      scrollPositionX,
    } = this.state;

    if (!dayWidths) {
      return;
    }

    let datePositionX = 0;
    let firstVisibleDateIndex = undefined;
    let lastVisibleDateIndex = undefined;

    // Iterate through `dayWidths` to  $FlowFixMe
    Object.values(dayWidths).some((width: number, index: number) => {

      if (firstVisibleDateIndex === undefined       // not set yet
        && datePositionX >= scrollPositionX  // first date visible
      ) {
        firstVisibleDateIndex = index > 0 ? index - 1 : index;
      }

      if (lastVisibleDateIndex === undefined                      // not set yet
        && datePositionX >= scrollPositionX + screenWidth  // first date not visible behind the right edge
      ) {
        lastVisibleDateIndex = index;
      }

      // Increment date position by its width for the next iteration
      datePositionX += width;

      // return true when both first and last visible days found to break out of loop
      return !!(firstVisibleDateIndex && lastVisibleDateIndex);
    });

    // Return a subset of visible dates only
    return dates.slice(firstVisibleDateIndex, lastVisibleDateIndex);
  };

  getVisibleMonthAndYear = (): ?string => {
    const {
      dates,
      visibleMonths,
      visibleYears,
    } = this.state;

    // No `visibleMonths` or `visibleYears` yet
    if (!visibleMonths || !visibleYears) {
      // Return the month and the year of the very first date
      if (dates) {
        const firstDate = dates[0];
        return `${formatMonth(firstDate)}, ${formatYear(firstDate)}`;
      }
      return undefined;
    }

    // One or two months withing the same year
    if (visibleYears.length === 1) {
      return `${visibleMonths.join(' – ')},  ${visibleYears[0]}`;
    }

    // Two months within different years
    return visibleMonths
      .map((month, index) => `${month}, ${visibleYears[index]}`)
      .join(' – ');
  };

  updateVisibleMonthAndYear = () => {

    const { allDatesHaveRendered } = this.state;

    if (!allDatesHaveRendered) {
      return;
    }

    const visibleDates = this.getVisibleDates();

    if (!visibleDates) {
      return;
    }

    let visibleMonths = [];
    let visibleYears = [];

    visibleDates.forEach((date: Moment) => {
      const month = formatMonth(date);
      const year = formatYear(date);
      if (!visibleMonths.includes(month)) {
        visibleMonths.push(month);
      }
      if (!visibleYears.includes(year)) {
        visibleYears.push(year);
      }
    });

    this.setState({
      visibleMonths,
      visibleYears,
    });
  };


  onScroll = (event: { nativeEvent: { contentOffset: { x: number, y: number } } }) => {
    const { nativeEvent: { contentOffset: { x } } } = event;
    this.setState({ scrollPositionX: x }, this.updateVisibleMonthAndYear);
  };


  render() {

    const {
      dates,
      currentDateIndex,
    } = this.state;

    const visibleMonthAndYear = this.getVisibleMonthAndYear();

    return (
      <View>
        <Text style={styles.visibleMonthAndYear}>
          {visibleMonthAndYear}
        </Text>
        <ScrollView
          ref={scrollView => { this._scrollView = scrollView; }}
          horizontal={true}                         // Enable horizontal scrolling
          showsHorizontalScrollIndicator={false}    // Hide horizontal scroll indicators
          automaticallyAdjustContentInsets={false}  // Do not adjust content automatically
          scrollEventThrottle={100}
          onScroll={this.onScroll}
        >
        <Dates
          dates={dates}
          currentDateIndex={currentDateIndex}
          onSelectDay={this.onSelectDay}
          onRenderDay={this.onRenderDay}
        />
          <Text>{JSON.stringify(dates, null, 2)}</Text>
        </ScrollView>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  visibleMonthAndYear: {
    color: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 15,
    textAlign: 'left',
  },
});

