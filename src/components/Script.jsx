import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Dropdown from 'react-dropdown';
import FlipMove from 'react-flip-move';
import {shuffle} from 'lodash';
import axios from "axios";

import * as query from './getData';
import HeaderButtons from './HeaderButtons.jsx';
import MovieComponent from './MovieComponent.jsx';

import Toggle from './Buttons/Toggle.jsx';

class RobotMasterList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sortedBy: 'timestamp',
            error: null,
            removedMovies: [],
            movies: [],
            view: 'list',
            order: 'asc',
            series: [2, 3, 4, 5],
            selectedSeries: '2',
            sortingMethod: 'chronological',
            enterLeaveAnimation: 'accordianHorizontal',
            inProgress: false,
        };

        this.sortShuffle = this.sortShuffle.bind(this);
        this.toggleSort = this.toggleSort.bind(this);
        this.toggleGrid = this.toggleGrid.bind(this);
        this.toggleList = this.toggleList.bind(this);
        this.refresh = this.refresh.bind(this);
        this.selectSeries = this.selectSeries.bind(this);
    }

    toggleSort() {
        function compare(a,b) {
            if (a.Title < b.Title)
                return -1;
            if (a.Title > b.Title)
                return 1;
            return 0;
        }
        const sortAsc = (a, b) => parseInt(a.id, 10) - parseInt(b.id, 10);
        const sortDesc = (a, b) => parseInt(b.id, 10) - parseInt(a.id, 10);

        this.setState({
            order: (this.state.order === 'asc' ? 'desc' : 'asc'),
            sortingMethod: 'chronological',
            movies: this.state.movies.sort(
                this.state.order === 'asc' ? sortDesc : sortAsc)

        });
    }

    selectSeries(e) {
        //Need more elegant way than e.target.textContent
        if (this.state.selectedSeries === e.target.textContent) return;

        this.setState({
            selectedSeries: e.target.textContent,
        });
    }

    toggleList() {
        this.setState({
            view: 'list',
            enterLeaveAnimation: 'accordianVertical',
        });
    }

    toggleGrid() {
        this.setState({
            view: 'grid',
            enterLeaveAnimation: 'accordianHorizontal',
        });
    }

    refresh() {
        this.getData();
    }

    componentDidMount() {
        this.getData();
    }

    getData() {

        const movieNames = ['frozen','iron man', 'the prestige','Rain man'];

        const newMovies = [];
        for(let i = 0; i < movieNames.length; i++){
            if(i === movieNames.length) { // lets test with saving props over and overagain first

            }
            axios.get(`https://www.omdbapi.com/?t=` + movieNames[i])
                .then(res => {
                    try{
                        res.data.id = Date.now();
                        newMovies.push(res.data);
                        this.setState({movies: newMovies});
                        console.log(res.data);
                    } catch(error){
                        console.log(error.error);

                    }
                });
        }
    }

    componentWillUnmount() {
        this.serverRequest.abort();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.selectedSeries !== prevState.selectedSeries) {
            this.getData();
        }
    }

    moveRobotMaster(source, dest, index = 0) {
        if (this.state.inProgress) return;

        let sourceRobotMasters = this.state[source].slice();
        let destRobotMasters = this.state[dest].slice();

        if (!sourceRobotMasters.length) return;

        destRobotMasters = [].concat(sourceRobotMasters.splice(index, 1), destRobotMasters);

        this.setState({
            [source]: sourceRobotMasters,
            [dest]: destRobotMasters,
            inProgress: true,
        });
    }

    renderRobotMasters() {
        const {movies, view} = this.state;

        return movies.map((movie, i) => {
            return (
                <MovieComponent
                    key={movie.imdbID}
                    view={view}
                    index={i}
                    clickHandler={() => this.moveRobotMaster('movies', 'removedMovies', i)}
                    {...movie}
                />
            );
        });
    }
    createNew(e){
        this.setState({error: null});
        if (e.which === 13) {
            // finding the movie on omdb.com
            try{
                axios.get(`https://www.omdbapi.com/?t=` + e.target.value)
                    .then(res => {
                        console.log("response",res.data.response);
                        //if(res.data.response === "True") {
                            console.log(res.data);
                            res.data.id = Date.now();
                            this.setState({movies: this.state.movies.concat([res.data])});
                            console.log(this.state.movies);
                        //}else {
                         //   console.log("error!",res.data);
                         //   this.setState({error: res.data.Error});
                       // }

                    });
            } catch(error){
                this.setState({error:"Something went wrong!"});
                console.log(error);
            }
            e.target.value = "";
        }
    }

    sortShuffle() {
        this.setState({
            sortingMethod: 'shuffle',
            movies: shuffle(this.state.movies),
        });
    }
    selectSort(e){
        console.log(e);
    }

    render() {
        const {view, order, sortingMethod, error, series, sortedBy} = this.state;
        return (
            <div id="shuffle" className={view}>
                <HeaderButtons
                    view={view}
                    order={order}
                    sortingMethod={sortingMethod}
                    sortedBy={sortedBy}
                    listClickHandler={this.toggleList}
                    gridClickHandler={this.toggleGrid}
                    sortClickHandler={this.toggleSort}
                    shuffleClickHandler={this.sortShuffle}
                    refreshClickHandlder={this.refresh}
                    selectClickHanlder={this.selectSort}
                />
                <div className="dropdown-spacer" style={{height: 10}}/>
                <h1 class="error"> {error} </h1>
                <input className="new" onKeyPress={this.createNew.bind(this)}/>
                <ul>
                    <FlipMove
                        staggerDurationBy="30"
                        duration={500}
                        onFinishAll={() => {
                            // TODO: Remove the setTimeout, when the bug is fixed.
                            setTimeout(() => this.setState({inProgress: false}), 1);
                        }}>
                        { this.renderRobotMasters() }
                    </FlipMove>
                </ul>
            </div>
        );
    }
}

export default RobotMasterList