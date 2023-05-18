import cn from 'classnames';
import { startCase } from 'lodash';
interface Props {
  label: string,
  value: string,
  setValue: (value: any) => void,
  left: string,
  right: string
}

const Toggle : React.FC<Props> = ({ label, value, setValue, left, right }) => {
  return (
    <div className='m-2'>
      <label>{label}</label>
      <br />
      <button
        onClick={() => setValue(left)}
        className={cn(['ButtonLeft', { 'Active': value === left }])}
      >
        {startCase(left)}
      </button>
      <button
        onClick={() => setValue(right)}
        className={cn(['ButtonRight', { 'Active': value === right }])}
      >
        {startCase(right)}
      </button>
    </div>
  );
};
export default Toggle;
