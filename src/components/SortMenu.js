import React, {Component} from "react"; 


class SortMenu extends Component {
	render() {
		return (      
			<select onChange={(e)=>this.props.selectSort(e.target.value)} value={this.props.sortRule}>
				<option value="bestMatch">Sort: Best match</option>
				<option value="starDesc">Sort: Most stars</option>
				<option value="starAsc">Sort: Less stars</option>
				<option value="forkDesc">Sort: Most forks</option>
				<option value="forkAsc">Sort: Less forks</option>
			</select>
		);
	}
}

export default SortMenu;