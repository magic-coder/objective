/**
 * Created by Layman(http://github.com/anysome) on 16/3/1.
 */
import React from 'react';
import {StyleSheet, ScrollView, View, Text, TouchableOpacity, LayoutAnimation} from 'react-native';
import moment from 'moment';
import Button from 'react-native-button';
import {analytics, styles, colors, airloy, api, L, toast, hang} from '../../app';
import util from '../../libs/Util';
import Objective from '../../logic/Objective';
import TextField from '../../widgets/TextField';
import TextArea from '../../widgets/TextArea';
import PriorityPicker from '../../widgets/PriorityPicker';
import DatePicker from '../../widgets/DatePicker';

export default class Edit extends React.Component {

  constructor(props) {
    super(props);
    this._title = null;
    this.today = props.today;
    this.agenda = props.data || {today: this.today + 86400000 * 2, priority: 0, status: '0'};
    this.state = {
      title: this.agenda.title,
      detail: this.agenda.detail,
      today: moment(this.agenda.today).format('YYYY-MM-DD'),
      date: new Date(this.agenda.today),
      showPickerDate: false,
      priority: this.agenda.priority,
      showPickerPriority: false
    };
  }

  componentWillUpdate(props, state) {
    // smooths picker showing and hiding
    if (state.showPickerPriority !== this.state.showPickerPriority
      || state.showPickerDate !== this.state.showPickerDate) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    }
  }

  componentDidMount() {
  }

  _selectDate() {
    this.setState({
      showPickerPriority: false,
      showPickerDate: !this.state.showPickerDate
    });
  }

  _onSelectedDate(date) {
    this.setState({
      date: date,
      today: moment(date).format('YYYY-MM-DD'),
      showPickerDate: util.isAndroid() ? false : true
    });
  }

  _selectPriority() {
    this.setState({
      showPickerDate: false,
      showPickerPriority: !this.state.showPickerPriority
    });
  }

  _onSelectedPriority(value) {
    this.setState({
      priority: value,
      showPickerPriority: util.isAndroid()
    });
  }

  async _save() {
    let result;
    this.agenda.detail = this.state.detail;
    this.agenda.today = this.state.date;
    this.agenda.priority = this.state.priority;
    if (this.agenda.id) {
      if (this._title.value.length > 0) {
        this.agenda.title = this.state.title;
      }
      hang();
      result = await airloy.net.httpPost(api.agenda.update, this.agenda);
    } else {
      if (this._title.value.length < 1) {
        this._title.focus();
        return;
      }
      hang();
      this.agenda.title = this.state.title;
      result = await airloy.net.httpPost(api.agenda.add, this.agenda);
    }
    hang(false);
    if (result.success) {
      this.props.onFeedback(result.info);
    } else {
      toast(L(result.message));
    }
    analytics.onEvent('click_agenda_save');
  }

  render() {
    return (
      <ScrollView keyboardDismissMode='on-drag' keyboardShouldPersistTaps>
        <View style={styles.section}>
          <TextField
            ref={c => this._title = c}
            flat={true}
            defaultValue={this.state.title}
            onChangeText={(text) => this.setState({title:text})}
            placeholder={this.agenda.title || '想做什么...'}
            returnKeyType="done"
            autoFocus={this.agenda.title == null}
          />
          <View style={styles.separator}/>
          <TextArea
            flat={true}
            defaultValue={this.state.detail}
            onChangeText={(text) => this.setState({detail:text})}
            placeholder={this.agenda.detail || '如有备注...'}
            returnKeyType="default"
          />
        </View>
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectDate()}>
            <Text style={style.text}>日期</Text>
            <Text style={styles.picker}>{this.state.today}</Text>
          </TouchableOpacity>
          <DatePicker visible={this.state.showPickerDate}
                      date={this.state.date}
                      onDateChange={date => this._onSelectedDate(date)}/>
          <View style={styles.separator}/>
          <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectPriority()}>
            <Text style={style.text}>优先级</Text>
            <Text style={styles.picker}>{Objective.getPriorityName(this.state.priority)}</Text>
          </TouchableOpacity>
          <PriorityPicker visible={this.state.showPickerPriority}
                          selectedValue={this.state.priority}
                          onValueChange={value => this._onSelectedPriority(value)}/>
        </View>
        {this.agenda.status === '0' &&
          <Button
            style={styles.buttonText}
            containerStyle={styles.buttonAction}
            activeOpacity={0.5}
            onPress={()=>this._save()}>
            保存
          </Button>}
      </ScrollView>
    );
  }
}

const style = StyleSheet.create({
  text: {
    paddingTop: 5,
    paddingBottom: 5,
    color: colors.dark2,
    fontSize: 14
  }
});
