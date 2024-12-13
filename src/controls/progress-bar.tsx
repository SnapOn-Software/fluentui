import { DividerProps, makeStyles, mergeClasses, ProgressBar, tokens } from '@fluentui/react-components';
import { CheckmarkRegular, FluentIcon } from '@fluentui/react-icons';
import { isFunction, isNotEmptyString } from '@kwiz/common';
import React from 'react';
import { KnownClassNames } from '../styles/styles';
import { Horizontal } from './horizontal';
import { Section } from './section';
import { Vertical } from './vertical';

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
    },
    stepLabel: {
        backgroundColor: tokens.colorNeutralBackground1,
        position: "absolute",
        top: '-10px',
        left: 0,
        right: 0,
        "& > span": {
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "inline-block"
        }
    },
    stepNumberCurrent: {
        border: `2px solid ${tokens.colorBrandBackground}`,
    },
    stepNumberCompleted: {
        border: `2px solid ${tokens.colorBrandBackground}`,
        backgroundColor: tokens.colorBrandBackground,
        color: tokens.colorNeutralBackground1,
    },
    stepNumberClickable: {
        cursor: "pointer"
    },
    stepTitle: {
        fontSize: tokens.fontSizeBase400,
        lineHeight: tokens.lineHeightBase400,
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
    stepIcons?: FluentIcon[];
    onStepClick?: (step: number) => void;
}
export const ProgressBarEX = React.forwardRef<HTMLDivElement, (React.PropsWithChildren<IProps>)>((props, ref) => {
    const classes = useStyles();

    let stepLabels: JSX.Element[] = [];
    for (let i = 0; i < props.steps; i++) {
        const stepClasses = [classes.stepNumber];
        let addLabel = false;
        let canClick = false;
        if (props.step === i) {
            stepClasses.push(classes.stepNumberCurrent);
            if (isNotEmptyString(props.stepLabel))
                addLabel = true;
        }
        else if (props.step > i) {
            stepClasses.push(classes.stepNumberCompleted);
            canClick = isFunction(props.onStepClick);
            if (canClick)
                stepClasses.push(classes.stepNumberClickable);
        }
        let StepIcon = props.stepIcons?.[i];
        stepLabels.push(<Section key={`step${i}`} css={stepClasses} onClick={canClick ? () => props.onStepClick(i) : undefined}>{StepIcon ? <StepIcon /> : `${i + 1}`}</Section>);
        stepLabels.push(<Section main key={`step${i}Spacer`} css={[classes.stepSpacer]}>
            {addLabel && <Horizontal key="label" hCentered css={[classes.stepLabel, KnownClassNames.progressBarStepLabel]}>
                <span>{props.stepLabel}</span>
            </Horizontal>}
        </Section>);

    }

    let StepIcon = props.stepIcons?.[props.steps];
    //add last submit step
    stepLabels.push(<span key='stepSubmit' className={mergeClasses(classes.stepNumber, props.step === props.steps && classes.stepNumberCompleted)}>{StepIcon ? <StepIcon /> : <CheckmarkRegular />}</span>);

    return (
        <Vertical css={[classes.root, ...(props.css || [])]}>
            {/* progress bar first so labels will cover it without the need for zindex */}
            <ProgressBar className={classes.progressBar} value={(props.step * 2) + 1} max={props.steps * 2} />
            <Horizontal css={[classes.stepTitle]}>{...stepLabels}</Horizontal>
        </Vertical >
    );
}); 