import { useEffect } from "react";

type PageTitleProps = {
  title: string;
};

const PageTitle = ({ title }: PageTitleProps) => {
  useEffect(() => {
    document.title = `ReDirect.ly | ${title}`;

    return () => {
      document.title = "ReDirect.ly";
    };
  }, [title]);

  return null;
};

export default PageTitle;
