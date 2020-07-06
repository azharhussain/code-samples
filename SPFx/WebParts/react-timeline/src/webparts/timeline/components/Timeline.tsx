import * as React from 'react';
import styles from './Timeline.module.scss';
import { ITimelineProps } from './ITimelineProps';
import { ITimelineState } from './ITimelineState';
import { escape } from '@microsoft/sp-lodash-subset';
import TimelineService from '../../../services/TimelineService';

import TimelineActivity from "./TimelineActivity";
import { ITimelineActivity } from "../../../models/ITimelineActivity";
import { SPPermission } from '@microsoft/sp-page-context';


export default class Timeline extends React.Component<ITimelineProps, ITimelineState> {
  private TimelineService: TimelineService = null;
  private canEdit: any = null;

  constructor(props: ITimelineProps) {
    super(props);

    this.state = {
      timelineActivities: [],
      isloading: false
    };

    this.TimelineService = new TimelineService(this.props.context);
    this.onDismissPanel = this.onDismissPanel.bind(this);
    let permission = new SPPermission(this.props.context.pageContext.web.permissions.value);
    this.canEdit = permission.hasPermission(SPPermission.manageWeb);
    console.log(this.canEdit + "Edit");
  }

  private async onDismissPanel(refresh: boolean) {
    if (refresh === true) {
      this.TimelineService.getTimelineActivities(this.props.listName, this.props.sortOrder).then((activities: ITimelineActivity[]) => {
        this.setState({ timelineActivities: activities });
      });
    }
  }

  public render(): React.ReactElement<ITimelineProps> {
    return (
      <div className={styles.timeline}>
        <h1>{this.props.description}</h1>
        <div className={this.props.layout == "Vertical" ? `${styles.timelineContainerVertical}` : `${styles.timelineContainerHorizontal}`}>
          {
            this.state.timelineActivities.map((activity, i) => {
              return (
                <TimelineActivity activity={activity}
                  index={i}
                  context={this.props.context}
                  onDissmissPanel={this.onDismissPanel}
                  displayPanel={false}
                  listName={this.props.listName}
                  layout={this.props.layout}
                  showImage={this.props.showImage}
                  showDescription={this.props.showDescription}
                  dateFormat={this.props.dateFormat}
                  canEdit={this.canEdit} >
                </TimelineActivity>
              );
            })}
        </div>
      </div>
    );
  }

  public componentDidMount(): void {
    this.TimelineService.getTimelineActivities(this.props.listName, this.props.sortOrder).then((activities: ITimelineActivity[]) => {
      this.setState({ timelineActivities: activities });
    });
  }

  public componentWillReceiveProps(nextProps: ITimelineProps) {
    if (this.props.sortOrder !== nextProps.sortOrder) {
      this.TimelineService.getTimelineActivities(this.props.listName, nextProps.sortOrder).then((activities: ITimelineActivity[]) => {
        this.setState({ timelineActivities: activities });
      });
    }
  }
}
