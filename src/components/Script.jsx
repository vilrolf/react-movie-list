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
            sortedBy: 'id',
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
        this.onSelectChange = this.onSelectChange.bind(this);
        this.sort = this.sort.bind(this);

    }

    sort(method) {
        console.log("this.state", this.state);
        function compare(a, b) {
            if (a.Title < b.Title)
                return -1;
            if (a.Title > b.Title)
                return 1;
            return 0;
        }

        let sortedBy = "";
        let order = "";
        if (method) {
            if (method === 'asc' || method === 'desc') {
                order = method;
                sortedBy = this.state.sortedBy;
                this.setState({order: order});
            } else {
                sortedBy = method;

                order = this.state.order;
                this.setState({sortedBy: method});
            }
        } else {
            sortedBy = this.state.sortedBy;
            order = this.state.order;
        }

        console.log("sortedBy", sortedBy);
        console.log("order:", this.state.order);

        const sortAsc = (a, b) => parseFloat(a[sortedBy]) - parseFloat(b[sortedBy]);
        const sortDesc = (a, b) => parseFloat(b[sortedBy]) - parseFloat(a[sortedBy]);
        this.setState({
            movies: this.state.movies.sort(
                order === 'asc' ? sortDesc : sortAsc)
        });
    }

    toggleSort() {
        console.log("toggle sort");
        this.setState({
            sortingMethod: 'chronological',
        });
        this.sort((this.state.order === 'asc' ? 'desc' : 'asc'));
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
    save(){
        localStorage.setItem("movies", JSON.stringify(this.state.movies));
    }

    refresh() {
        this.save();
        //this.getData();
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        if (typeof(Storage) !== "undefined") {
            if (localStorage.movies) {
                this.setState({movies: JSON.parse(localStorage.movies)});
            } else {
                const movieNames = ['frozen', 'iron man', 'the prestige', 'Rain man'];

                const newMovies = [];
                for (let i = 0; i < movieNames.length; i++) {
                    if (i === movieNames.length) { // lets test with saving props over and overagain first

                    }
                    axios.get(`https://www.omdbapi.com/?t=` + movieNames[i])
                        .then(res => {
                            try {
                                res.data.id = Date.now();
                                newMovies.push(res.data);
                                this.setState({movies: newMovies});
                                console.log(res.data);
                            } catch (error) {
                                console.log(error.error);
                            }
                        });
                }
            }
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

    createNew(e) {
        this.setState({error: null});
        if (e.which === 13) {
            // finding the movie on omdb.com
            try {
                axios.get(`https://www.omdbapi.com/?t=` + e.target.value)
                    .then(res => {
                        console.log("response", res.data.response);
                        //if(res.data.response === "True") {
                        console.log(res.data);
                        res.data.id = Date.now();
                        this.setState({movies: this.state.movies.concat([res.data])});
                        console.log(this.state.movies);
                        this.sort();
                        //}else {
                        //   console.log("error!",res.data);
                        //   this.setState({error: res.data.Error});
                        // }

                        this.save();
                    });
            } catch (error) {
                this.setState({error: "Something went wrong!"});
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

    onSelectChange(e) {
        console.log("this.state", this.state);
        console.log(e.target.value);
        // this.setState({sortedBy: e.target.value});
        //console.log("sortedByState",this.state.sortedBy);
        this.sort(e.target.value);

        // console.log("e",e);
        // console.log("e.target",e.target);
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
                    onSelectChange={this.onSelectChange}
                />
                <div className="dropdown-spacer" style={{height: 10}}/>
                <h1 class="error"> {error} </h1>
                <input placeholder="Enter a movie" className="new" onKeyPress={this.createNew.bind(this)}/>
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