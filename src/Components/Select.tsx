import ReactSelect from 'react-select';

interface Props {
  label: string,
  value: number,
  setValue: (value: number) => void,
  options: number[],
}

const Select : React.FC<Props> = ({ label, value, setValue, options }) => {
  const selectOptions = options.map((option) => {
    return { label: option.toString(), value: option };
  })

  return (
    <div className='m-2'>
      <label>{label}</label>
      <br />
      <ReactSelect
        value={selectOptions.find((option) => option.value === value)}
        options={selectOptions}
        onChange={(option) => { if (option) setValue(option.value) }}
      />
    </div>
  );
};
export default Select;
