import React, {Component} from "react"; 

class SearchBar extends Component {
	constructor(props) {
		super(props);
		this.inputRef = React.createRef();
	}

	render() {
		return (
			<div className={this.props.smallHeader ? "header smallHeader" : "header" }>		
				<input 
					onKeyDown={(e)=>this.props.handleKeyDown(e,e.target.value)} 
					type="text" 
					name="search" 
					className="searchBar"
					placeholder="Search for GitHub Repos" 
					ref={this.inputRef}
					disabled = {this.props.disabled}
				/>
				<button type="button" className="searchBtn" onClick={()=>this.props.handleClick(this.inputRef.current["value"])}>Go</button>
			</div>
		);
	}
}

export default SearchBar;
