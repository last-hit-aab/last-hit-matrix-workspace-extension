import { WorkspaceExtensions } from 'last-hit-types';
import { AbstractWorkspaceExtensionEntryPoint } from 'last-hit-workspace-extension';

const matrixRegexp = /^matrix:(.+)\?(.+)$/;

export abstract class AbstractMatrixWorkspaceExtensionEntryPoint extends AbstractWorkspaceExtensionEntryPoint {
	async handleFlowShouldStart(
		event: WorkspaceExtensions.FlowShouldStartEvent,
		helpers: WorkspaceExtensions.HandlerTestHelper
	): Promise<WorkspaceExtensions.PreparedFlow> {
		return await this.findHandler(
			`flow-should-start@${this.transformToRealFlowName(event.flow.name)}@${
				event.story.name
			}`,
			'flow-should-start',
			`${event.story.name}/${this.transformToRealFlowName(event.flow.name)}/flow-should-start`
		).handle!(event, helpers);
	}
	async handleFlowAccomplished(
		event: WorkspaceExtensions.FlowAccomplishedEvent,
		helpers: WorkspaceExtensions.HandlerHelpers
	): Promise<WorkspaceExtensions.AccomplishedFlow> {
		return await this.findHandler(
			`flow-accomplished@${this.transformToRealFlowName(event.flow.name)}@${
				event.story.name
			}`,
			'flow-accomplished',
			`${event.story.name}/${this.transformToRealFlowName(event.flow.name)}/flow-accomplished`
		).handle!(event, helpers);
	}

	async handleStepShouldStart(
		event: WorkspaceExtensions.StepShouldStartEvent,
		helpers: WorkspaceExtensions.HandlerHelpers
	): Promise<WorkspaceExtensions.PreparedStep> {
		return await this.findHandler(
			`step-should-start@${event.step.stepUuid}@${this.transformToRealFlowName(
				event.flow.name
			)}@${event.story.name}`,
			'step-should-start',
			`${event.story.name}/${this.transformToRealFlowName(event.flow.name)}/${
				event.step.stepUuid
			}/step-should-start`
		).handle!(event, helpers);
	}
	async handleStepOnError(
		event: WorkspaceExtensions.StepOnErrorEvent,
		helpers: WorkspaceExtensions.HandlerHelpers
	): Promise<WorkspaceExtensions.FixedStep> {
		return await this.findHandler(
			`step-on-error@${event.step.stepUuid}@${this.transformToRealFlowName(
				event.flow.name
			)}@${event.story.name}`,
			'step-on-error',
			`${event.story.name}/${this.transformToRealFlowName(event.flow.name)}/${
				event.step.stepUuid
			}/step-on-error`
		).handle!(event, helpers);
	}
	async handleStepAccomplished(
		event: WorkspaceExtensions.StepAccomplishedEvent,
		helpers: WorkspaceExtensions.HandlerHelpers
	): Promise<WorkspaceExtensions.AccomplishedStep> {
		return await this.findHandler(
			`step-accomplished@${event.step.stepUuid}@${this.transformToRealFlowName(
				event.flow.name
			)}@${event.story.name}`,
			'step-accomplished',
			`${event.story.name}/${this.transformToRealFlowName(event.flow.name)}/${
				event.step.stepUuid
			}/step-accomplished`
		).handle!(event, helpers);
	}
	handleReloadFlowHandler(event: WorkspaceExtensions.ReloadFlowHandlerEvent): Promise<void> {
		Object.values(this.getHandlers())
			.filter(handler => {
				return (
					handler.story === event.story.name &&
					handler.flow === this.transformToRealFlowName(event.flow.name)
				);
			})
			.forEach(handler => {
				this.doReloadHandler(handler);
			});
		return Promise.resolve();
	}
	handleReloadStepHandler(event: WorkspaceExtensions.ReloadStepHandlerEvent): Promise<void> {
		Object.values(this.getHandlers())
			.filter(handler => {
				return (
					handler.story === event.story.name &&
					handler.flow === this.transformToRealFlowName(event.flow.name) &&
					handler.stepUuid === event.step.stepUuid
				);
			})
			.forEach(handler => {
				this.doReloadHandler(handler);
			});
		return Promise.resolve();
	}
	protected transformToRealFlowName(flowName: string): string {
		if (flowName.startsWith('matrix:')) {
			const matches = flowName.match(matrixRegexp);
			if (matches == null) {
				return flowName;
			} else {
				return matches[1];
			}
		} else {
			return flowName;
		}
	}
}
