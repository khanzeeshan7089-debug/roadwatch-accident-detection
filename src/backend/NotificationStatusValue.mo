import OQL "mo:caffeineai-oql";

// OQL value conversion for the responder notification-status variant.
module {
  public func _toRow(self : { #pending; #notified; #failed }) : OQL.Value =
    #text(
      switch self {
        case (#pending) { "pending" };
        case (#notified) { "notified" };
        case (#failed) { "failed" };
      }
    );
};
