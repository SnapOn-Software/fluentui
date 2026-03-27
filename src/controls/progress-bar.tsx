import { Caption1Strong, DividerProps, makeStyles, mergeClasses, ProgressBar, tokens, Tooltip } from '@fluentui/react-components';
import { CheckmarkRegular } from '@fluentui/react-icons';
import { debounce, isFunction, isNotEmptyString } from '@kwiz/common';
import React, { useCallback, useState } from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { KnownClassNames, mixins } from '../styles/styles';
import { FluentIconType } from '../types/common';
import { Horizontal } from './horizontal';
import { Section } from './section';
import { Vertical } from './vertical';

export const ProgressBarEXClassNames = {
    hasLabels: "with-label",
    current: "current-step",
    completed: "completed-step"
} as const;

const useStyles = makeStyles({
    root: {
        position: "relative"
    },
    stepNumber: {
        border: `2px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusCircular,
        width: '24px',
        height: '24px',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tokens.colorNeutralBackground1,
        [`&.${ProgressBarEXClassNames.current}`]: {
            border: `2px solid ${tokens.colorBrandBackground}`,
        },
        [`&.${ProgressBarEXClassNames.completed}`]: {
            border: `2px solid ${tokens.colorBrandBackground}`,
            backgroundColor: tokens.colorBrandBackground,
            color: tokens.colorNeutralBackground1,
        },
    },
    stepLabel: {
        backgroundColor: tokens.colorNeutralBackground1,
        position: "absolute",
        top: '36px',
        left: '-38px',
        right: '-38px',
        "& > span:first-child": {
            textAlign: "center",
            ...mixins.multiLineEllipsis2
        }
    },
    stepNumberClickable: {
        cursor: "pointer"
    },
    stepTitle: {
        fontSize: tokens.fontSizeBase400,
        lineHeight: tokens.lineHeightBase400,
        [`&.${ProgressBarEXClassNames.hasLabels}`]: {
            paddingBottom: '22px'
        }
    },
    progressBar: {
        position: "absolute",
        top: "14px"
    },
    stepSpacer: {
        position: "relative"
    }
});
interface IProps extends DividerProps {
    steps: number;
    step: number;
    stepLabel?: string;
    css?: string[];
    /** optional, send an icon instead of the step number */
    stepIcons?: FluentIconType[];
    onStepClick?: (step: number) => void;
}
export const ProgressBarEX = React.forwardRef<HTMLDivElement, (React.PropsWithChildren<IProps>)>((props, ref) => {
    const classes = useStyles();
    const ctx = useKWIZFluentContext();

    let stepLabels: JSX.Element[] = [];
    let hasLabel = false;
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipClicked, setTooltipClicked] = useState(false);
    const delayHideTooltip = useCallback(debounce(() => {
        setTooltipClicked(false);
        setShowTooltip(false);
    }, 5000), []);
    for (let i = 0; i < props.steps; i++) {
        let showLabel = false;
        const stepClasses = [classes.stepNumber];
        let canClick = false;

        if (props.step === i && isNotEmptyString(props.stepLabel)) {
            showLabel = true;
            hasLabel = true;
        }

        if (props.step === i) {
            stepClasses.push(ProgressBarEXClassNames.current);
        }
        else if (props.step > i) {
            stepClasses.push(ProgressBarEXClassNames.completed);
            canClick = isFunction(props.onStepClick);
            if (canClick)
                stepClasses.push(classes.stepNumberClickable);
        }

        let StepIcon = props.stepIcons?.[i];
        stepLabels.push(<Section key={`step${i}`} css={stepClasses} onClick={canClick ? () => props.onStepClick(i) : undefined}>{StepIcon ? <StepIcon /> : `${i + 1}`}</Section>);
        stepLabels.push(<Section main key={`step${i}Spacer`} css={[classes.stepSpacer]}>
            {showLabel && <Horizontal key="label" hCentered
                css={[classes.stepLabel,
                props.step === i ? ProgressBarEXClassNames.current : props.step > i ? ProgressBarEXClassNames.completed : undefined,
                KnownClassNames.progressBarStepLabel
                ]}>
                <Tooltip visible={showTooltip} onVisibleChange={(e, data) => {
                    if (data.visible) { if (!showTooltip) setShowTooltip(true); }
                    else//hide
                    {
                        if (tooltipClicked)//delay hide
                            delayHideTooltip();
                        else//not from click - hide immediately
                            setShowTooltip(false);
                    }

                }} showDelay={1000} relationship='label' withArrow appearance='inverted' content={props.stepLabel} mountNode={ctx.mountNode}>
                    <Caption1Strong onClick={() => { setTooltipClicked(true); setShowTooltip(true); }}
                        style={{ width: `${100 / props.steps}wv` }}>{props.stepLabel}</Caption1Strong>
                </Tooltip>
            </Horizontal>}
        </Section>);
    }

    let StepIcon = props.stepIcons?.[props.steps];
    //add last submit step
    stepLabels.push(<span key='stepSubmit' className={mergeClasses(classes.stepNumber, props.step === props.steps && ProgressBarEXClassNames.completed)}>{StepIcon ? <StepIcon /> : <CheckmarkRegular />}</span>);

    return (
        <Vertical css={[classes.root, ...(props.css || [])]}>
            {/* progress bar first so labels will cover it without the need for zindex */}
            <ProgressBar className={classes.progressBar} value={(props.step * 2) + 1} max={props.steps * 2} />
            <Horizontal css={[classes.stepTitle, hasLabel ? ProgressBarEXClassNames.hasLabels : undefined]}>{...stepLabels}</Horizontal>
        </Vertical >
    );
}); 