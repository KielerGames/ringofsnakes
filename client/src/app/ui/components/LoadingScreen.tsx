import { Component } from "preact";
import * as ResourceLoader from "../../ResourceLoader";

import "../../../styles/loading-screen.less";

type Props = { stage: ResourceLoader.LoadingStage };
type State = { progress: number };

export default class LoadingScreen extends Component<Props, State> {
    state = { progress: this.props.stage.progress };

    render() {
        return (
            <div id="loading-screen">
                <div class="progress-bar" style={"--progress:" + this.state.progress}></div>
            </div>
        );
    }

    componentWillMount(): void {
        this.props.stage.addChangeListener(() =>
            this.setState({ progress: this.props.stage.progress })
        );
        // It is currently not required to explicitly remove this listener
        // because the event will do so itself after loading completed.
    }
}
