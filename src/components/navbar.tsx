import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { GiHamburgerMenu } from 'react-icons/gi';
import { LoadingSpinner } from "~/components/loading";


export const NavBar = () => {
  const { isLoaded: userLoaded, user , isSignedIn } = useUser();
  if(isSignedIn && !user) return null;
  return (
    <div className="navbar bg-background fixed top-0 z-10 mb-24">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <p><GiHamburgerMenu /></p>
          </label>
          <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>Item 1</a></li>
            <li tabIndex={0}>
              <a className="justify-between">
                Parent
                <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" /></svg>
              </a>
              <ul className="p-2">
                <li><a>Submenu 1</a></li>
                <li><a>Submenu 2</a></li>
              </ul>
            </li>
            <li><a>Item 3</a></li>
          </ul>
        </div>
        <a className="btn btn-ghost normal-case text-3xl hidden lg:inline-flex"> <span>Track<span className="text-primary">My</span>Trip</span></a>
      </div>
      <a className="btn btn-ghost normal-case text-2xl lg:hidden text-center"><span>Track<span className="text-primary">My</span>Trip</span></a>
      <div className="navbar-end">
        <div className="flex p-4">
         {!userLoaded && (
          <LoadingSpinner/>
         )}
          {(!isSignedIn && !user && userLoaded) ? (
            <div className="flex justify-center border-2 px-4 py-2 rounded-md border-primary">
              <SignInButton />
            </div>
          ) : (
            (isSignedIn && user) && (
            <div className="dropdown dropdown-end">
              <label tabIndex={0}>
                <a className="cursor-pointer">
                  <Image
                    src={user.profileImageUrl}
                    alt="Profile image"
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                </a>
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                <li><a>Item 1</a></li>
                <li><a>Item 2</a></li>
              </ul>
              </div>
              )
              )}
              </div>
      </div>
    </div>
  )
}