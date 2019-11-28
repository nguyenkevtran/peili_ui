import React from 'react';
import './questions.styles.scss';

import { QUESTION_TYPE } from '../../context/questionsData';

import TypesSlider from '../../components/questions/question-types/question-types-slider/question-types-slider.component';
import TypesRange from '../../components/questions/question-types/question-types-range/question-types-range.component';
import TypesTrueFalse from '../../components/questions/question-types/question-types-trueFalse/question-types-trueFalse.component';
import TypesText from '../../components/questions/question-types/question-types-text/question-types-text.component';
import TypesOptions from '../../components/questions/question-types/question-types-options/question-types-options.component';
import TypesDate from '../../components/questions/question-types/question-types-date/question-types-date.component';

// import QuestionsContent from '../../components/questions/questions-content/questions-content.component';
import QuestionsBar from '../../components/questions/questions-bar/questions-bar.component';

import { AuthContext } from '../../context/authContext';
import { withRouter } from 'react-router-dom';

class QuestionsPage extends React.Component {
  level = 0;
  history = null;
  // startQuestionId = null;
  // questionLoaded = null;
  // questionsInLevel = null;
  constructor(props) {
    super(props);
    console.log(props);
    this.history = props.history;
    this.level = Number(props.match.params.level);
  }
  static contextType = AuthContext;
  state = {
    testResults: [],
    totalExp: 0,
    totalFreeTimePoint: 0,
    totalHealthPoint: 0,
    totalSchoolPoint: 0,
    totalSocialLifePoint: 0,
    answer: null,
    questionLoaded: null,
    questionIdArray: [],
    questionsInLevel: null,
    startQuestionId: null,
  };

  componentDidMount() {
    this.setState(
      {
        testResults: this.context.userTestResults.testResults,
        totalExp: this.context.userTestResults.totalExp,
        totalFreeTimePoint: this.context.userTestResults.totalFreeTimePoint,
        totalHealthPoint: this.context.userTestResults.totalHealthPoint,
        totalSchoolPoint: this.context.userTestResults.totalSchoolPoint,
        totalSocialLifePoint: this.context.userTestResults.totalSocialLifePoint,
        questionsInLevel: this.context.userTestResults.testResults.find(item => item.level === Number(this.level)),
      },
      () => {
        // console.log(this.state.questionsInLevel);
        this.setState(
          {
            // questionsInLevel : this.state.testResults.find(item => item.level === Number(this.level)),
            questionIdArray: this.state.questionsInLevel.questionIdArray,
            startQuestionId: this.state.questionsInLevel.startQuestionId,
            // startQuestionId: this.getStartQuestionId(this.state.questionsInLevel),
          },
          () => {
            this.setState({
              questionLoaded: this.getQuestion(this.state.questionsInLevel, this.state.startQuestionId),
            });
          }
        );
      }
    );
  }

  // handle change of all question types components
  answerOptions = [0, 0, 0, 0];
  handleChange = e => {
    const type = e.target.type;

    if (type === 'checkbox') {
      e.target.checked
        ? (this.answerOptions[Number(e.target.value) - 1] = Number(e.target.value))
        : (this.answerOptions[Number(e.target.value) - 1] = 0);
      this.setState({
        answer: this.answerOptions,
      });
    } else {
      this.setState({
        answer: e.target.value,
      });
    }
  };

  // get questionLoaded
  getQuestion = (questionInLevel, questionId) => {
    return questionInLevel.questions.find(question => question.id === questionId);
  };

  // get start question id
  getStartQuestionId = questionInLevel => {
    return questionInLevel.startQuestionId;
  };

  // get next question ID
  getNextQuestionId = question => {
    if (question) {
      const type = question.type;
      let condition = question.nextQuestion.condition;
      switch (type) {
        case QUESTION_TYPE.slider:
          if (condition) {
            condition = parseInt(condition);
            const answerSlide = parseInt(this.state.answer);
            if (answerSlide < condition && question.nextQuestion.nextQuestionId) {
              return question.nextQuestion.nextQuestionId;
            }
            return question.nextQuestion.defaultNextQuestion;
          }
          break;
        case QUESTION_TYPE.range:
          if (condition) {
            condition = parseInt(condition);
            const answerRange = parseInt(this.state.answer);
            if (answerRange <= condition && question.nextQuestion.nextQuestionId) {
              return question.nextQuestion.nextQuestionId;
            }
            return question.nextQuestion.defaultNextQuestion;
          }
          break;
        case QUESTION_TYPE.trueFalse:
          if (condition) {
            const answerTrueFalse = this.state.answer;
            if (answerTrueFalse === condition && question.nextQuestion.nextQuestionId) {
              return question.nextQuestion.nextQuestionId;
            }
            return question.nextQuestion.defaultNextQuestion;
          }
          break;
        case QUESTION_TYPE.text:
          return question.nextQuestion.defaultNextQuestion;
        case QUESTION_TYPE.options:
          if (condition) {
            condition = parseInt(condition);
            const answerOptions = this.state.answer.filter(item => item > 0);
            if (condition <= answerOptions.length && question.nextQuestion.nextQuestionId) {
              return question.nextQuestion.nextQuestionId;
            }

            return question.nextQuestion.defaultNextQuestion;
          }
          break;
        case QUESTION_TYPE.date:
          return question.nextQuestion.defaultNextQuestion;
        default:
          return;
      }
    }
  };

  // get and show the next question
  nextQuestion = () => {
    const nextQuestionId = this.getNextQuestionId(this.state.questionLoaded);
    this.addTheAnswerAndPoints();
    this.state.questionsInLevel.startQuestionId = nextQuestionId;
    this.state.questionsInLevel.questionIdArray = [...this.state.questionIdArray, this.state.questionLoaded.id];
    this.setState(
      {
        questionIdArray: [...this.state.questionIdArray, this.state.questionLoaded.id],
        questionLoaded: this.getQuestion(this.state.questionsInLevel, nextQuestionId),
        answer: null,
        // startQuestionId: nextQuestionId,
        questionInLevel: this.state.questionsInLevel,
      },
      () => {
        if (this.state.questionIdArray.length === this.state.questionsInLevel.numberOfQuestion) {
          this.history.push('/tests');
        }
      }
    );
  };
  // get and show prev question
  prevQuestion = () => {
    if (this.state.questionIdArray.length > 0) {
      this.removeTheAnswerAndPoints();
      const prevQuestionId = this.state.questionIdArray.pop();
      // console.log('prev question id', prevQuestionId);
      this.setState(
        {
          questionIdArray: [...this.state.questionIdArray],
          questionLoaded: this.getQuestion(this.state.questionsInLevel, prevQuestionId),
        },
        () => {
          if (this.state.questionLoaded.answer) {
            this.setState({ answer: this.state.questionLoaded.answer });
          }
          // console.log('question ID Array:', this.state.questionIdArray);
        }
      );
    }
  };

  // and the answer and exp point when user click next button
  addTheAnswerAndPoints = () => {
    this.state.questionLoaded.answer = this.state.answer;
    this.addCategory(this.state.questionLoaded.category);

    this.setState(
      {
        // testResults: this.state.testResults.,
        totalExp: this.state.totalExp + 1,
      },
      () => {
        this.syncStorage();
      }
    );
  };

  // remove the answer and exp point when user click prev button
  removeTheAnswerAndPoints = () => {
    this.subCategory(this.state.questionLoaded.category);
    this.setState(
      {
        totalExp: this.state.totalExp - 1,
      },
      () => {
        this.syncStorage();
      }
    );
  };

  // save data to localstore with key=userId
  syncStorage = () => {
    const userTestResults = {
      testResults: this.state.testResults,
      totalExp: this.state.totalExp,
      totalFreeTimePoint: this.state.totalFreeTimePoint,
      totalHealthPoint: this.state.totalHealthPoint,
      totalSchoolPoint: this.state.totalSchoolPoint,
      totalSocialLifePoint: this.state.totalSocialLifePoint,
    };
    localStorage.setItem(this.context.userId, JSON.stringify(userTestResults));
  };

  // add 1 point to category point if the question have category type
  addCategory = category => {
    switch (category) {
      case 'school':
        this.setState({ totalSchoolPoint: this.state.totalSchoolPoint + 1 });
        break;
      case 'free time':
        this.setState({ totalFreeTimePoint: this.state.totalFreeTimePoint + 1 });
        break;
      case 'health':
        this.setState({ totalHealthPoint: this.state.totalHealthPoint + 1 });
        break;
      case 'social life':
        this.setState({ totalSocialLifePoint: this.state.totalSocialLifePoint + 1 });
        break;
      default:
        break;
    }
  };

  // sub 1 point to category point if user back question
  subCategory = category => {
    switch (category) {
      case 'school':
        this.setState({ totalSchoolPoint: this.state.totalSchoolPoint - 1 });
        break;
      case 'free time':
        this.setState({ totalFreeTimePoint: this.state.totalFreeTimePoint - 1 });
        break;
      case 'health':
        this.setState({ totalHealthPoint: this.state.totalHealthPoint - 1 });
        break;
      case 'social life':
        this.setState({ totalSocialLifePoint: this.state.totalSocialLifePoint - 1 });
        break;
      default:
        break;
    }
  };

  render() {
    // console.log('All state:', this.state);
    return (
      <div className="questions-page">
        {/* <QuestionsContent question={questionLoaded} /> */}
        <div className="questions-content">
          <p>{this.state.questionLoaded && this.state.questionLoaded.questions.content}</p>
          {this.state.questionLoaded && this.state.questionLoaded.type === 'slider' ? (
            <TypesSlider handleChange={this.handleChange} answer={this.state.answer} />
          ) : null}
          {this.state.questionLoaded && this.state.questionLoaded.type === 'range' ? (
            <TypesRange handleChange={this.handleChange} answer={this.state.answer} />
          ) : null}
          {this.state.questionLoaded && this.state.questionLoaded.type === 'trueFalse' ? (
            <TypesTrueFalse handleChange={this.handleChange} answer={this.state.answer} />
          ) : null}
          {this.state.questionLoaded && this.state.questionLoaded.type === 'text' ? (
            <TypesText handleChange={this.handleChange} answer={this.state.answer} />
          ) : null}
          {this.state.questionLoaded && this.state.questionLoaded.type === 'options' ? (
            <TypesOptions handleChange={this.handleChange} answer={this.state.answer} />
          ) : null}
          {this.state.questionLoaded && this.state.questionLoaded.type === 'date' ? (
            <TypesDate handleChange={this.handleChange} answer={this.state.answer} />
          ) : null}
        </div>
        <QuestionsBar nextQuestion={this.nextQuestion} prevQuestion={this.prevQuestion} />
      </div>
    );
  }
}

export default withRouter(QuestionsPage);
