import React, { PropTypes } from 'react';

const propTypes = {
  view: PropTypes.string.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
  avatar: PropTypes.string,
  sprite1: PropTypes.string,
  weapon: PropTypes.string,
  weakness: PropTypes.string,
};

class MovieComponent extends React.Component {
  render() {
    const { view, imdbID, Title, Poster, sprite1, Year, imdbRating } = this.props;
    const listClass = `list-item card ${view}`;
    const style = { zIndex: 100 - this.props.index};

    return (
      <li id={imdbID} className={listClass} style={style}>
        <span>
          <div className="robot-mug">
            <img src={Poster}/>
          </div>          
          <div className="robot-info">            
            <h2 className="robot-weapon">Year</h2>
            <div>{Year}</div>
            <h2 className="robot-weakness">Rating</h2>
            <div>{imdbRating}</div>
          </div>
          <div className="robot-other">
            <h1 className="robot-name">{Title}</h1>
          </div>
          <button onClick={this.props.clickHandler}>
            <i className="fa fa-close"/>
          </button>
          <div className="clearfix"/>
        </span>
      </li>
    );
  }
}

MovieComponent.PropTypes = propTypes;

export default MovieComponent;
