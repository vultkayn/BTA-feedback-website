import React, { useState, forwardRef, useEffect } from "react";
import Form, { ValidatedInput, validators } from "./Form";

import {
  Box,
  Button,
  Chip,
  Typography,
  ClickAwayListener,
  Divider,
  Checkbox,
  Radio,
  RadioGroup,
  ToggleButton,
  ToggleButtonGroup,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import ResponsiveFunction from "./ResponsiveFunctions";
import FormCard from "./FormCard";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import RadioButtonCheckedOutlinedIcon from "@mui/icons-material/RadioButtonCheckedOutlined";

function ChoiceInput({
  choice,
  id,
  format = "radio",
  onCheck,
  onLabelChange,
  onNameChange,
  onTouch,
  sx,
}) {
  return (
    <Box
      width='40%'
      display='flex'
      sx={sx}>
      <Box
        display='inline-flex'
        flexDirection='column'
        justifyContent='center'
        height='100%'>
        {format === "checkbox" ? (
          <Checkbox
            checked={choice.answer}
            onClick={onCheck}
          />
        ) : (
          <Radio value={id} />
        )}
      </Box>
      <ValidatedInput
        placeholder='Label:'
        label='label'
        name={`label[${id}]`}
        margin='none'
        onFocus={onTouch}
        value={choice.label}
        onChange={onLabelChange}
      />
      <ValidatedInput
        placeholder='Name:'
        label='name'
        name={`name[${id}]`}
        margin='none'
        onFocus={onTouch}
        value={choice.name}
        onChange={onNameChange}
      />
    </Box>
  );
}

const QuestionFormCard = forwardRef(function QuestionFormCard(
  {
    qidx,
    question,
    setQuestion = () => {},
    onTouch = (e, { content, idx }) => {},
    ...FormCardProps
  },
  ref
) {
  /* Last one is never uploaded */
  useEffect(() => {
    let choices = { ...question?.choices };
    if (!choices) choices = { format: "radio", list: [] };

    if (!choices.list?.length) {
      choices.list = [
        {
          name: "",
          label: "",
          answer: true,
        },
        {
          name: "",
          label: "",
          answer: false,
        },
        {
          name: "",
          label: "",
          answer: false,
        },
      ];
      setQuestion({ ...question, choices }, -1);
    }
  }, [question, setQuestion]);

  const choices = question?.choices;

/*   React.useEffect(() => {
    let list = choices?.list;
    if (!list) return;
    let last = list[list.length - 1];
    if (last.label && last.name) {
      list.push({ name: undefined, label: undefined, answer: false });
      setQuestion({ ...question, choices: { ...choices, list } }, qidx);
    }
  }, [choices, question, setQuestion]); */

  const setChoices = (choices) => {
    setQuestion({ ...question, choices }, qidx);
  };

  const onChange = (param) => (e) => {
    let q = {...question};
    q[param] = e.target.value;
    setQuestion(q);
  }

  let choicesList =
    choices?.list &&
    choices.list.map((choice, idx) => {
      return (
        <ChoiceInput
          key={`choice-${idx}`}
          id={idx}
          format={choices.format}
          choice={choice}
          sx={{ mb: 1.5 }}
          onCheck={(e) => {
            let list = [...choices.list];
            list[idx].answer = !list[idx].answer;
            setChoices({ ...choices, list: list });
          }}
          onLabelChange={(e) => {
            let list = [...choices.list];
            list[idx].label = e.target.value;
            setChoices({ ...choices, list: list });
          }}
          onNameChange={(e) => {
            let list = [...choices.list];
            list[idx].name = e.target.value;
            setChoices({ ...choices, list: list });
          }}
          onTouch={(e) => onTouch(e, { question, idx: qidx })}
        />
      );
    });

  return (
    <FormCard
      idx={qidx}
      {...FormCardProps}>
      <Box
        display='flex'
        flexDirection='row'
        gap={2}
        justifyContent='space-between'>
        <ValidatedInput
          margin='normal'
          label='Title'
          defaultValue={question?.title ?? ""}
          onChange={onChange("title")}
          validator={validators.length(1, 20)}
          name={`title[${qidx}]`}
          fullWidth
          onFocus={(e) => onTouch(e, { question, idx: qidx })}
        />
        <ValidatedInput
          margin='normal'
          label='Statement'
          defaultValue={question?.statement ?? ""}
          validator={validators.length(1, 100)}
          name={`statement[${qidx}]`}
          onChange={onChange("statement")}
          fullWidth
          onFocus={(e) => onTouch(e, { question, idx: qidx })}
        />
      </Box>
      <ValidatedInput
        placeholder='Explanation'
        label='Explanation'
        name={`explanation[${qidx}]`}
        onChange={onChange("explanation")}
        defaultValue={question?.explanation ?? ""}
        margin='normal'
        minRows={4}
        multiline
        fullWidth
        onFocus={(e) => onTouch(e, { question, idx: qidx })}
      />
      <Divider variant='middle'>
        <Chip
          label='Choices'
          color='primary'
          variant='outlined'
        />
      </Divider>
      <Box
        width='100%'
        mt={4}
        display='flex'
        flexDirection='column'
        gap={3}>
        <Box
          width='100%'
          display='flex'
          flexDirection='row'
          justifyContent='center'>
          <ToggleButtonGroup
            value={choices?.format ?? "radio"}
            exclusive
            onChange={(e, newFormat) => {
              if (!choices?.list) return;
              let list = [...choices.list];
              if (newFormat === "radio") {
                for (let c of list) c.answer = false;
                list[0].answer = true;
              }
              setChoices({ ...choices, list: list, format: newFormat });
            }}
            aria-label='question choices format'>
            <ToggleButton
              value='checkbox'
              aria-label='checkbox'>
              <CheckBoxOutlinedIcon />
            </ToggleButton>
            <ToggleButton
              value='radio'
              aria-label='radio'>
              <RadioButtonCheckedOutlinedIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {choices?.format === "checkbox" ? (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 2,
            }}>
            {choicesList}
          </Box>
        ) : (
          <RadioGroup
            row
            value={(() => {
              if (!choices?.list) return 0;
              for (let i = 0; i < choices.list.length; i++) {
                if (choices.list[i].answer === true) return i;
              }
            })()}
            onChange={(e, newValue) => {
              if(!choices.list) return;
              let list = [...choices.list];
              for (let c of list) c.answer = false;
              list[parseInt(newValue)].answer = true;
              setChoices({ ...choices, list: list });
            }}>
            {choicesList}
          </RadioGroup>
        )}
      </Box>
    </FormCard>
  );
});

export function QuestionAddingList({
  disabled = false,
  lastQuestion = null,
  questions = null,
  setQuestions = null,
  setLastQuestion = null,
  onDrop = async () => {},
  onNew = async () => {},
  onFocusOut = async () => {},
}) {
  const [focusedQuestion, setFocusedQuestion] = useState(-1);

  const handleClickAway = (idx) => async (e) => {
    if (focusedQuestion === idx) {
      const error = await onFocusOut(questions[idx]);
      if (error == null) setFocusedQuestion(-2);
    }
  };

  const setQuestion = (question, idx) => {
    if (idx === -1) return setLastQuestion(question);
    let newQ = [...questions]
    newQ[idx] = question;
    setQuestions(newQ);
  }

  return (
    <Box
      width='fit-content'
      maxHeight='70vh'
      overflow='auto'
      flexGrow={1}>
      <Typography
        variant='h5'
        align='center'
        paragraph>
        Questions
      </Typography>
      <Box
        padding={10}
        display='flex'
        flexDirection='column'
        gap={5}>
        {questions.map((q, idx) => {
          return (
            <ClickAwayListener
              key={`newquest-${idx}`}
              onClickAway={handleClickAway(idx)}>
              <QuestionFormCard
                qidx={idx}
                onTouch={(e) => {
                  e.stopPropagation();
                  setFocusedQuestion(idx);
                }}
                onDeleteAction={onDrop(idx)}
                focused={focusedQuestion === idx}
                question={q}
                setQuestion={setQuestion}
                disabled={disabled}
              />
            </ClickAwayListener>
          );
        })}
        <ClickAwayListener onClickAway={handleClickAway(-1)}>
          <QuestionFormCard
            qidx={-1}
            onTouch={(e) => {
              e.stopPropagation();
              setFocusedQuestion(-1);
            }}
            focused={focusedQuestion === -1}
            hasAddButton
            question={lastQuestion}
            setQuestion={setLastQuestion}
            onAddAction={onNew}
            onDeleteAction={onDrop(-1)}
          />
        </ClickAwayListener>

        {/*         <Box sx={{ width: "100%", position: "static" }}>
          <LinearProgress
            variant='determinate'
            value={
              !questionsListRef.current
                ? 0
                : ((questionsListRef.current.scrollTop.height -
                    questionsListRef.current.scrollTop) *
                    100) /
                  (questionsListRef.current.scrollTop.height -
                    questionsListRef.current.scrollTop)
            }
          />
        </Box> */}
      </Box>
    </Box>
  );
}

export const ExerciseCreationForm = React.forwardRef(
  function ExerciseCreationForm({ exercise, errors, readOnly }, ref) {
    const defaultValueProp = (value) => {
      return value ? { defaultValue: value } : {};
    };
    const labelProp = (label) => {
      return readOnly ? {} : { label: label };
    };
    return (
      <Form
        method='post'
        reactForm={true}
        id='Login-form'
        ref={ref}
        display='flex'
        flexDirection='column'
        alignItems='center'
        width='100%'>
        <Box
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
          height='50vh'
          width='fit-content'
          flexShrink={0}>
          <ValidatedInput
            name='name'
            validator={validators.length(3, 20)}
            margin='normal'
            error={errors.name != null}
            helperText={errors?.name?.msg || ""}
            fullWidth
            required={!readOnly}
            InputProps={{
              readOnly: readOnly,
            }}
            {...labelProp("Name")}
            {...defaultValueProp(exercise?.name)}
          />
          <ValidatedInput
            multiline
            name='description'
            margin='normal'
            minRows={4}
            spellCheck='true'
            error={errors.description != null}
            helperText={errors?.description?.msg || ""}
            placeholder='Enter a description'
            fullWidth
            required={!readOnly}
            InputProps={{
              readOnly: readOnly,
            }}
            {...defaultValueProp(exercise?.description)}
            {...labelProp("Description")}
          />
          <Button
            className='btn-submit'
            type='submit'
            sx={{
              display: "flex",
              alignSelf: "right",
            }}
            variant='contained'
            disabled={readOnly}>
            Submit
          </Button>
        </Box>{" "}
        {/* Exercise proper */}
      </Form>
    );
  }
);
