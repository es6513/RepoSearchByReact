import React, {Component} from "react"; 

class Repolists extends Component {
	render() {
		let star;
		if(this.props.star >= 1000){
			star = Math.round(this.props.star / 1000 * 10) / 10  + "k";
		}else{
			star = this.props.star;
		}
		return (
			<div className="repo">
				<div className="repoDetail">
					<div className="repoLeft">
						<h3><a href={this.props.link}>{this.props.reponame}</a></h3>
						<p><strong>Description:</strong> {this.props.description}</p>
						<p><strong>Language:</strong> {this.props.language}</p>
					</div>
			
					<div className="repoRight">
						<a className="starLink" href={this.props.link + "/stargazers"}>
							<span className="starimage"></span>
							<span className="staramount">{star}</span>
						</a>
					</div>
				</div>
			</div>
		);
	}
}

export default Repolists;