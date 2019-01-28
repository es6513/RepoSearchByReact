import React, { Component } from "react";
import axios from "axios";
import Repolists from "./components/Repolists/Repolists";
import SearchBar from "./components/SearchBar.js";
import SortMenu from "./components/SortMenu";
import swal from "sweetalert";

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			searchValue:"",
			perpage:20,
			page:null,
			maxpage:null,
			total_count:null,
			repos:[],
			sortRule:"",
			pageLoading:false,
			dataLoading:false,
			noresult:false,
			changeSmallHeader:false,
			disableRequest:false,
			clearTimeOut:null
		};
	}

	handleSearchBarStyle(){
		let y = window.pageYOffset;
		let changeSmallHeader = this.state.changeSmallHeader;
		if(y >= 200 && !changeSmallHeader){
			this.setState({
				...this.state,
				changeSmallHeader:true,
			});
		}else if(y < 200 && changeSmallHeader){
			this.setState({
				...this.state,
				changeSmallHeader:false,
			});
		}
	}

	handleClickSearch(value){
		let {disableRequest} = this.state;
		if(disableRequest){
			swal("Rate Limit","Still not reset rate limit yet.","warning");
		}	else if(value && !disableRequest){
			this.handleSearchValue(value);
		}else if(!value){
			swal("You need to type something for search");
		}
	}

	handleSearchValue(value){
		let currentValue = this.state.searchValue;
		let repos = [...this.state.repos];
		if(value === currentValue) return;
		else if(value !== currentValue){
			repos.length = 0;
			this.setState({
				...this.state,
				noresult:false,
				searchValue:value,
				sortRule:"",
				repos:repos,
				page:1,
				dataLoading:true
			},this.loadRepos);
		}
	}

	handleEnterSearch(e,value){
		let {disableRequest} = this.state;
		// for press enter key
		if(e.keyCode === 13 && disableRequest){
			swal("Rate Limit","Still not reset rate limit yet.","warning");
		}else	if(e.keyCode === 13 && value && !disableRequest){
			this.handleSearchValue(value);
		}else if(e.keyCode === 13 && !value){
			swal("You need to type something for search");
		}
	}

	handleDataScroll(){
		const {
			pageLoading, maxpage, page,disableRequest
		} = this.state;
		const repos = [...this.state.repos]; 
		let lastRepo; 
		let lastRepoOffset; 
		let pageOffset; 
		let bottomOffset;
		if (pageLoading) return;
		if (maxpage <= page) return;
		if(repos.length !== 0){
			lastRepo = document.querySelector("div.repolists > div:last-child");
			lastRepoOffset = lastRepo.offsetTop + lastRepo.clientHeight;
			pageOffset = window.pageYOffset + window.innerHeight;
			bottomOffset = 20;
		}

		if(pageOffset > lastRepoOffset - bottomOffset && disableRequest){
			swal("Rate Limit","Still not reset rate limit yet.","warning");
			window.scrollTo(0, lastRepoOffset - 2000);
		}else	if (pageOffset > lastRepoOffset - bottomOffset && !disableRequest) {
			this.handleLoadRepo();
		}
	}

	loadRepos(){
		const {
			page,perpage,searchValue
		} = this.state;
		const repos = [...this.state.repos];
		const currentIdArr = repos.map(repo=>{
			return repo["id"];
		});
		let fetchedRepos = [];
		let updatedRepos = [];
		let refreshTime;
		let timeNow;
		let waitTime;
		let updatedMaxPage;
		let timeoutId;
		let lastRepo;
		let lastRepoOffset;
		let pageOffset; 
		let bottomOffset;
		let sortOrder;
		switch (this.state.sortRule) {
		case "bestMatch":sortOrder =  "";
			break;
		case "starDesc":sortOrder = "&sort=stars&order=desc";
			break;
		case "starAsc":sortOrder = "&sort=stars&order=asc";
			break;
		case "forkDesc":sortOrder = "&sort=forks&order=desc";
			break;
		case "forkAsc":sortOrder = "&sort=forks&order=asc";
			break;
		default:sortOrder = "";
		}
		axios.get(`https://api.github.com/search/repositories?page=${page}&per_page=${perpage}&q=${searchValue}${sortOrder}`)
			.then(response=>{
				// ----------------no result----------------
				if(response.data.total_count === 0){
					this.setState({
						maxpage:null,
						total_count:null,
						dataLoading:false,
						noresult:true
					});
					return;
				}
				// ----------------update data----------------
				updatedMaxPage = Math.ceil(response.data.total_count / perpage);
				
				fetchedRepos = Object.keys(response.data.items).map(repo=>{
					return{
						...response.data.items[repo],
						id:response.data.items[repo].id
					};
				});
				updatedRepos = repos.concat(fetchedRepos.filter(repo=>{
					return !(currentIdArr.includes(repo["id"]));
				}));
				this.setState({
					maxpage:updatedMaxPage,
					repos:updatedRepos,
					pageLoading:false,
					dataLoading:false,
					noresult:false,
					total_count:response.data.total_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
				});
			})
			.catch(error=>{
				// avoid when error search value is equal to previous value
				if(repos.length === 0){
					this.setState({searchValue:""});
				} 
				// set page to prevstate and loading to false
				this.setState(previousState=>({
					page: previousState.page - 1,
					pageLoading:false,
					dataLoading:false
				}));			

				//for rate limit control
				refreshTime = new Date(error.response.headers["x-ratelimit-reset"] * 1000);
				timeNow = new Date();
				waitTime = new Date(refreshTime - timeNow).getSeconds();
				if(repos.length !== 0){
					lastRepo = document.querySelector("div.repolists > div:last-child");
					lastRepoOffset = lastRepo.offsetTop + lastRepo.clientHeight;
					pageOffset = window.pageYOffset + window.innerHeight;
					bottomOffset = 20;
				}
				if(pageOffset > lastRepoOffset - bottomOffset){					
					window.scrollTo(0, lastRepoOffset - 2000);
				}
				if(!this.state.clearTimeOut && refreshTime > timeNow){
					timeoutId = setTimeout(() => {
						this.setState({
							disableRequest:false,
							clearTimeOut:null
						});
						swal(`You can request data now`);
						//let scroll bar scroll up a little
						if(repos.length !== 0){
							lastRepo = document.querySelector("div.repolists > div:last-child");
							lastRepoOffset = lastRepo.offsetTop + lastRepo.clientHeight;
							pageOffset = window.pageYOffset + window.innerHeight;
							bottomOffset = 20;
						}
						if(pageOffset > lastRepoOffset - bottomOffset){					
							window.scrollTo(0, lastRepoOffset - 2000);
						}
					}, waitTime * 1000);
					this.setState({
						disableRequest:true,
						clearTimeOut:timeoutId
					});
					swal(`Rate Limit`,`You request too many times in one minute, please wait for ${waitTime} second(s) to reset`,"warning");
				}	
			});
	}

	handleLoadRepo(){
		if(!this.state.dataLoading ){
			this.setState(previousState => ({
				page: previousState.page + 1,
				pageLoading: true,
			}), this.loadRepos);
		}
	}

	componentDidMount() {
		window.addEventListener("scroll", (e) => {
			this.handleDataScroll(e);
			this.handleSearchBarStyle();
		});
	}

	handleSort(sortRule){
		let repos = [...this.state.repos];
		let {disableRequest} = this.state;
		// for press enter key
		if(disableRequest){
			swal("Rate Limit","Still not reset rate limit yet.","warning");
		}else if(!disableRequest){
			repos.length = 0;
			this.setState({
				page:1,
				repos:repos,
				sortRule:sortRule,
				dataLoading:true
			},this.loadRepos);
		}
	}

	render() {
		let repos;
		let len = this.state.repos.length;
		if(len > 0){
			repos = this.state.repos.map(repo=>{
				return  <Repolists 
					key={repo.id}
					link={repo.html_url} 
					reponame={repo.full_name}
					description={repo.description}
					language={repo.language}
					star={repo.stargazers_count}
				/>;
			});
		}
		return (
			<div className="container">
				<SearchBar
				  smallHeader={this.state.changeSmallHeader}
					handleKeyDown={(e,value)=>this.handleEnterSearch(e,value)}
					handleClick={(value)=>this.handleClickSearch(value)}
					disabled={this.state.dataLoading}
				/>
				<div className="repolists">
					{len > 0 ? 
						<h2 className="repoamount">{this.state.total_count} repository results of {this.state.searchValue} 
						 <br />( 20 results per request )
							<SortMenu selectSort={(sortVal)=>this.handleSort(sortVal)} sortRule={this.state.sortRule}/>
						</h2> 
						: null}
					{!this.state.noresult ? repos : <h2 className="no-result">No Result for {this.state.searchValue}</h2>}
				</div>
			</div>
		);
	}
}

export default  App;