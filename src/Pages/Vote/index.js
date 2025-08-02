import React from "react";
import {
  Button,
  Stack,
  Typography,
  Table,
  Box,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import Web3 from "web3";
import toast from "react-hot-toast";
import { getIPFSURL } from "../../Utils/pinata";
import {
  RPC,
  vrtABI,
  vrtAddress,
  daoABI,
  daoAddress,
} from "../../Constants/config";

const web3 = new Web3(new Web3.providers.HttpProvider(RPC));
const daoContract = new web3.eth.Contract(daoABI, daoAddress);
const vrtContract = new web3.eth.Contract(vrtABI, vrtAddress);

class Vote extends React.Component {
  constructor() {
    super();
    this.state = {
      elections: [],
      owner: "",
      admin: "",
    };
  }

  async componentWillReceiveProps(nextProps) {
    await this.init(nextProps);
  }

  async init(nextProps) {
    if (nextProps.account) {
      const owner = await daoContract.methods.owner().call();
      const admin = await daoContract.methods.admin().call();

      let elections = [];
      let electionCount = await daoContract.methods.proposalIndex().call();
      for (let i = 0; i < electionCount; i++) {
        const election = await daoContract.methods.proposals(i).call();
        console.log("Election data:", election); // Debug: Log the election data structure
        const vote = await daoContract.methods
          .votesHistory(this.props.account, election.id / 1)
          .call();

        if (vote === false) {
          elections.push(election);
        }
      }
      this.setState({
        elections: elections,
        owner: owner,
        admin: admin,
      });
    }
  }

  async componentWillMount() {
    await this.init(this.props);
  }

  async vote(proposalID, trueOrFalse) {
    if (this.state.position === "GUEST") {
      toast.error("You are not a Member!");
      return;
    }

    const balance = await vrtContract.methods
      .balanceOf(this.props.account)
      .call();
    if (balance === 0) {
      toast.error("You are not a member of Vegan Rob's DAO");
      return;
    }

    // Check if wallet is available
    if (!window.ethereum) {
      toast.error("No wallet found. Please install MetaMask or another Web3 wallet.");
      return;
    }

    const votePromise = async () => {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(1666600000) }],
      });

      const linkedContract = new window.web3.eth.Contract(daoABI, daoAddress);
      console.log(linkedContract);
      await linkedContract.methods
        .vote(proposalID, trueOrFalse)
        .send({ from: this.props.account })
        .once("confirmation", async () => {
          this.init();
        });
    };

    toast.promise(votePromise(), {
      loading: 'Voting...',
      success: 'Vote submitted successfully!',
      error: 'Failed to submit vote. Please try again.',
    });
  }

  async closeVote(proposalID) {
    if (
      this.props.account !== this.state.owner &&
      this.props.account !== this.state.admin
    ) {
      toast.error("You don't have permission to close this vote");
      return;
    }

    // Check if wallet is available
    if (!window.ethereum) {
      toast.error("No wallet found. Please install MetaMask or another Web3 wallet.");
      return;
    }

    const closeVotePromise = async () => {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(1666600000) }],
      });

      const linkedContract = new window.web3.eth.Contract(daoABI, daoAddress);
      await linkedContract.methods
        .stopVoting(proposalID)
        .send({ from: this.props.account })
        .once("confirmation", async () => {
          this.init(this.props);
        });
    };

    toast.promise(closeVotePromise(), {
      loading: 'Closing vote...',
      success: 'Vote closed successfully!',
      error: 'Failed to close vote. Please try again.',
    });
  }

  render() {
    return (
      <Box sx={{ pb: 5.5 }}>
        <Box
          sx={{
            p: 1.5,
            bgcolor: this.props.theme.palette.background.neutral,
          }}
        >
          <Stack
            sx={{
              px: this.props.matchUpMd ? 5 : 2,
              py: 2,
              bgcolor: this.props.theme.palette.background.default,
            }}
          >
            <Typography variant="h3">Vote to New Products Election</Typography>
            <Box sx={{ pt: 7 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          color: this.props.theme.palette.text.secondary,
                        },
                      }}
                    >
                      <TableCell align="left">Election Number</TableCell>
                      <TableCell align="center">Image</TableCell>
                      <TableCell align="center">Content</TableCell>
                      <TableCell align="center">Vote</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.elections.map((element, key) => {
                      console.log("Rendering element:", element); // Debug: Log each element being rendered
                      return (
                        <TableRow
                          key={key}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              border: 0,
                            },
                            "& td, & th": {
                              py: 0.5,
                            },
                          }}
                        >
                          <TableCell align="left">{key + 1}</TableCell>
                          <TableCell align="center">
                            <Stack
                              // flexDirection="row"
                              alignItems="center"
                              justifyContent="center"
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: 2,
                                border: `1px solid ${this.props.theme.palette.divider}`,
                              }}
                            >
                              <Box
                                src={
                                  element.source
                                    ? getIPFSURL(element.source)
                                    : "/images/election.png"
                                }
                                component="img"
                                sx={{ width: 40 }}
                                onError={(e) => {
                                  console.error("Image failed to load:", element.source);
                                  e.target.src = "/images/election.png";
                                }}
                                onLoad={() => {
                                  console.log("Image loaded successfully:", element.source);
                                }}
                              />
                            </Stack>
                          </TableCell>
                          <TableCell align="center">{element.name}</TableCell>
                          <TableCell align="center">
                            <Stack
                              flexDirection="row"
                              alignItems="center"
                              justifyContent="center"
                              gap={1}
                            >
                              <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                disabled={
                                  this.props.position === "GUEST" ? true : false
                                }
                                onClick={() => this.vote(element.id / 1, true)}
                                sx={{
                                  color: this.props.theme.palette.text.primary,
                                }}
                              >
                                Yes
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                disabled={
                                  this.props.position === "GUEST" ? true : false
                                }
                                onClick={() => this.vote(element.id / 1, false)}
                                sx={{
                                  color: this.props.theme.palette.text.primary,
                                }}
                              >
                                No
                              </Button>
                              {this.props.account === this.state.admin ||
                              this.props.account === this.state.owner ? (
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  disabled={
                                    this.props.position === "GUEST" ||
                                    this.props.position === "MEMBER"
                                      ? true
                                      : false
                                  }
                                  onClick={() => this.closeVote(element.id / 1)}
                                  sx={{
                                    color: this.props.theme.palette.text.primary,
                                  }}
                                >
                                  Close Voting
                                </Button>
                              ) : (
                                <></>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }
}

const withHook = (Component) => {
  return (props) => {
    const theme = useTheme();
    const matchUpMd = useMediaQuery(theme.breakpoints.up("md"));
    const { account, position } = useSelector((state) => state.userReducer);
    return (
      <Component
        theme={theme}
        position={position}
        account={account}
        matchUpMd={matchUpMd}
        {...props}
      />
    );
  };
};

export default withHook(Vote);
