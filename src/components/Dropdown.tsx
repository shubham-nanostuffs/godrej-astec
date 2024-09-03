import React from "react";
import { DownOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Dropdown } from "antd";

interface DropdownProps {
  label: string;
  items: MenuProps["items"];
  onClick: MenuProps["onClick"];
  buttonStyle?: React.CSSProperties;
  buttonClass?: string;
}

const CommonDropdown: React.FC<DropdownProps> = ({
  label,
  items,
  onClick,
  buttonStyle,
  buttonClass,
}) => {
  const menuProps = {
    items,
    onClick,
  };

  return (
    <Dropdown menu={menuProps}>
      <Button style={buttonStyle} className={buttonClass}>
        <div className="flex justify-between items-center w-full">
          <div className="">{label}</div>
          <DownOutlined className="" />
        </div>
      </Button>
    </Dropdown>
  );
};

export default CommonDropdown;
