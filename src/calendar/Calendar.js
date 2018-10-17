// @flow

import React, {PureComponent} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import moment from 'moment';


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

    const startDay = moment(currentDate || undefined).subtract(showDaysBeforeCurrent + 1, 'days');
    const totalDaysCount = showDaysBeforeCurrent + showDaysAfterCurrent + 1;

    return [...Array(totalDaysCount)]
      .map(_ => startDay.add(1, 'day').clone());
  };

  render() {
    return (
      <View>
        <Text style={styles.visibleMonthAndYear}>
          November, 2020 // random month and year for now
        </Text>
        <ScrollView
          ref={scrollView => { this._scrollView = scrollView; }}
          horizontal={true}                         // Enable horizontal scrolling
          showsHorizontalScrollIndicator={false}    // Hide horizontal scroll indicators
          automaticallyAdjustContentInsets={false}  // Do not adjust content automatically
        >
          <Text>{JSON.stringify(this.state.dates, null, 2)}</Text>
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

