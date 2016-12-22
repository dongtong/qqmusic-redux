/**
 * Created by jiawei6 on 2016/11/23.
 */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Observable} from 'rxjs/Observable';

import {searchActions} from '../../core/search';
import {nagivateActions} from '../../core/navigate';
import SearchOtherItem from './SearchOtherItem';
import SearchResultItem from './SearchResultItem';

import './SearchBar.css';

class SearchBar extends React.Component {
	static propTypes = {
		search: PropTypes.object.isRequired
	};

	constructor() {
		super(...arguments);
		this.handleInput = this.handleInput.bind(this);
		this.handleBtnClick = this.handleBtnClick.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
	}

	handleInput() {
		const value = this.input.value.trim();
		const {loadSearchSuggest, search: {lastQuery, suggest, hot}} = this.props;
		if (value !== '') { //在有输入的情况下加载数据
			loadSearchSuggest(value, lastQuery, !!suggest);
		} else {
			this.props.loadSearchHot(!!hot);
		}
	}

	handleBtnClick() {
		const value = this.input.value.trim();
		if (value !== '') { //在有输入的情况下跳转
			this.props.navigateToSearch('song', value, this.props.search.lastSearch);
		}
	}

	handleFocus() {
		const value = this.input.value.trim();
		const {loadSearchSuggest, loadSearchHot, search: {lastQuery, suggest, hot}} = this.props;

		if (value !== '') {
			loadSearchSuggest(value, lastQuery, !!suggest);
		} else {
			loadSearchHot(!!hot);
		}
	}

	handleBlur() {
		this.props.hideSuggestBox();
	}

	componentDidMount() {
		Observable.fromEvent(this.input, 'input')
			.debounceTime(200)
			.subscribe(() => {
				this.handleInput();
			})
	}

	/**
	 * 渲染suggest搜索结果box
	 * @returns {XML}
	 */
	renderSuggestBox() {
		const {search: {showSuggestBox, hot, suggest, lastSearch}} = this.props;
		let child = null;
		if (showSuggestBox) {
			switch (showSuggestBox) {
				case 'result':
					if (suggest) {
						const resultChilds = [];
						for (let list in suggest) {
							if (suggest.hasOwnProperty(list) && suggest[list].itemlist.length) {
								resultChilds.push(
									<div className="search_result_sort" key={list}>
										<h4 className="search_result_tit">
											<i className={`search_result_icon_${list}`}></i>
											{suggest[list].name}
										</h4>
										<ul>
											{
												suggest[list].itemlist.map((item, index) => {
													return (
														<SearchResultItem key={index} type={list} {...item}/>
													)
												})
											}
										</ul>
									</div>
								)
							}
						}
						child =
							<div className="search_result_box">
								{resultChilds}
							</div>;
					}
					break;
				case 'other':
					if (hot) {
						const hotkeys = hot.hotkey.slice(0, 5);
						child =
							<div className="search_other_box">
								<ul>
									{
										hotkeys.map((hotkey, index) => {
											return (
												<SearchOtherItem query={hotkey.k} key={index} lastSearch={lastSearch}/>
											)
										})
									}
								</ul>
							</div>;
					}
					break;
				default:
					break;
			}
			return (
				<div className="search_suggest_box">
					{child}
				</div>
			)
		} else {
			return null;
		}
	}

	render() {
		return (
			<div className="search_bar_wrap">
				<div className="search_bar">
					<input
						className="search_bar_input"
						type="text"
						autoComplete="off"
						maxLength="60"
						placeholder="搜索单曲、专辑、MV、歌词、歌单"
						tabIndex="0"
						//onInput={this.handleInput}
						onFocus={this.handleFocus}
						onBlur={this.handleBlur}
						ref={e => this.input = e}
					/>
					<button className="search_bar_btn" onClick={this.handleBtnClick}>
						<i className="search_bar_btn_icon"></i>
					</button>
				</div>
				{this.renderSuggestBox()}
			</div>
		)
	}
}

const mapDispatchToProps = {
	loadSearchSuggest: searchActions.loadSearchSuggest,
	loadSearchHot: searchActions.loadSearchHot,
	navigateToSearch: nagivateActions.navigateToSearch,
	hideSuggestBox: searchActions.hideSuggestBox
};

export default connect(
	null,
	mapDispatchToProps
)(SearchBar);